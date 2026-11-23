// Where the API lives. Split out of `api.ts` on 23-11-2026 when the 401
// handling pushed that file past the 200-line rule — and it was always a
// separate concern: `api.ts` is the envelope and the retry, this is the one
// decision about which host to send a request to.
//
// No imports, and none wanted: `api.ts` is in the server render graph.

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
 * server fetch throw. Because `apiGet` swallows failures by rule 1 in , that
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


/** The base for this runtime — absolute on the server, relative in the browser. */
export const BASE_URL = typeof window === 'undefined' ? SERVER_BASE_URL : CLIENT_BASE_URL;
