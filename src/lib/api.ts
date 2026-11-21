// The website's only door to the backend.
//
// Every NestJS route answers the same envelope — `{ success, data, meta,
// message }` on the way out, `{ success: false, error: { code, message } }` on
// the way in — so unwrapping it belongs in one place rather than in every
// page.
//
// **Two rules hold here, and the design depends on both:**
//
// 1. **A dead API must never blank a page.** This is the public face of the
//    business. `apiGet` returns `null` rather than throwing, and each caller
//    falls back to the content already in `src/data/`. A missing price is
//    better than a missing homepage.
// 2. **Server-side by default.** `state/decisions.md` puts the site behind a
//    Next.js server for SSR and SEO, so these run on the server and the
//    browser never sees the API host. Only the authenticated pages, which
//    hold a token in the browser, call out from the client.

/**
 * Where the API lives — and it is **two different answers**, which is why this
 * is not one constant.
 *
 * In the browser the right value is the same-origin relative `/api/v1`: Nginx
 * proxies it to the API on the same host, so no CORS is needed and the API host
 * never reaches the client. On the server a relative URL is not a URL at all —
 * Node's `fetch` throws `Failed to parse URL` on it — so a server render needs
 * an absolute origin.
 *
 * The trap this avoids: `NEXT_PUBLIC_*` is inlined into the client bundle, so
 * one variable cannot hold both. Setting it to an absolute internal address
 * would make the browser call `127.0.0.1`; leaving it relative makes every
 * server fetch throw. Because `apiGet` swallows failures by rule 1 above, that
 * second case does not show up as an error — the page quietly renders the
 * static `src/data/` fallback and looks fine. It cost a deployment to find.
 *
 * So: `API_INTERNAL_URL` is server-only (never `NEXT_PUBLIC_`), points straight
 * at the API on loopback, and bypasses Nginx — which also means a basic-auth
 * gate in front of the site does not block the site's own renders.
 */
// Defaults to 3000, the API's local port. The review VPS runs it on 4000 to
// stay clear of another project and sets API_INTERNAL_URL explicitly in the
// PM2 ecosystem — so the default is the one that makes `npm run dev` work with
// no setup, and the deployment states its own.
const SERVER_BASE_URL =
  process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:3000/api/v1';

const CLIENT_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api/v1';

const BASE_URL =
  typeof window === 'undefined' ? SERVER_BASE_URL : CLIENT_BASE_URL;

/** How long a server-side fetch may hang before the page gives up on it. */
const TIMEOUT_MS = 8_000;

interface Envelope<T> {
  success: boolean;
  data?: T;
  meta?: unknown;
  message?: string | null;
  error?: { code: string; message: string; details?: unknown };
}

export interface ApiFailure {
  code: string;
  message: string;
  status: number;
  /**
   * Whatever the API attached to the refusal. Carried through because some
   * refusals are a step in the flow rather than a dead end: an address whose
   * PIN straddles two service areas comes back 400 `AREA_AMBIGUOUS` with the
   * candidates in here, and the form turns them into a choice.
   */
  details?: unknown;
}

export type ApiOutcome<T> =
  | { ok: true; data: T; meta?: unknown }
  | { ok: false; error: ApiFailure };

/**
 * How long Next.js may serve a cached copy of a GET, in seconds.
 *
 * 300 is the default because catalog content changes when an administrator
 * edits it, not continuously — and an edit appearing within five minutes was
 * the agreed freshness. Pass `0` for anything per-customer; a cached booking
 * list would be one customer's bookings served to the next.
 */
export const DEFAULT_REVALIDATE = 300;

interface RequestOptions {
  /** Seconds to cache. 0 disables caching entirely. */
  revalidate?: number;
  /** Customer access token, for the authenticated routes. */
  token?: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiOutcome<T>> {
  const { revalidate = DEFAULT_REVALIDATE, token, method = 'GET', body } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: controller.signal,
      // A mutation or a per-customer read must never be cached or shared.
      ...(method === 'GET' && revalidate > 0
        ? { next: { revalidate } }
        : { cache: 'no-store' as const }),
    });

    const envelope = (await response.json().catch(() => ({}))) as Envelope<T>;

    if (!response.ok || envelope.success === false) {
      return {
        ok: false,
        error: {
          code: envelope.error?.code ?? 'REQUEST_FAILED',
          message: envelope.error?.message ?? `Request failed (${response.status})`,
          status: response.status,
          details: envelope.error?.details,
        },
      };
    }

    return { ok: true, data: envelope.data as T, meta: envelope.meta };
  } catch (cause) {
    // Network down, DNS, or the timeout above. Named distinctly so a caller
    // can tell "the API said no" from "the API never answered".
    return {
      ok: false,
      error: {
        code: cause instanceof Error && cause.name === 'AbortError'
          ? 'TIMEOUT'
          : 'NETWORK_ERROR',
        message: 'Could not reach the server',
        status: 0,
      },
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * A GET whose failure is not the page's problem — returns `null` so the caller
 * can fall back to its static content. Use this for everything public.
 */
export async function apiGet<T>(
  path: string,
  options?: Omit<RequestOptions, 'method' | 'body'>,
): Promise<T | null> {
  const result = await request<T>(path, options);

  if (!result.ok) {
    // Logged, not thrown: a broken catalog must not take the homepage with it.
    console.warn(`[api] GET ${path} failed: ${result.error.code}`);
    return null;
  }

  return result.data;
}

/** A GET whose failure the caller handles — the signed-in pages. */
export const apiGetResult = <T>(
  path: string,
  options?: Omit<RequestOptions, 'method' | 'body'>,
) => request<T>(path, { revalidate: 0, ...options });

/** POST / PATCH / PUT / DELETE. Never cached, failure always returned. */
export const apiSend = <T>(
  path: string,
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  body?: unknown,
  token?: string,
) => request<T>(path, { method, body, token, revalidate: 0 });
