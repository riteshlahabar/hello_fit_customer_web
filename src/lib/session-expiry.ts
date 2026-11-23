// What happens when a signed-in session dies under the customer's feet.
//
// **The bug this exists for.** The access token lives 15 minutes
// (`JWT_ACCESS_TTL`, backend `env.validation.ts`). Nothing on the website ever
// swapped it for a fresh one, so a customer who left the dashboard open came
// back to a page that still looked signed in — the shell, the sidebar, the
// panels — with every live number replaced by a dash and "Sign in to see your
// sessions" where their bookings had been. The page was lying: they were
// logged out, and the only thing it told them was that their bookings had
// vanished.
//
// Two answers, in this order:
//
//  1. `auth.ts` tries the refresh token first — a 30-day token the API has
//     always issued and the site never used. Most expiries are recoverable
//     and the customer should never see them.
//  2. When that fails there is no session left to save, and the honest screen
//     is the login screen. That is this module.
//
// A leaf on purpose: no imports at all. `api.ts` is in the server render graph
// and must not reach a `'use client'` module, so the eject cannot live in
// `auth.ts` where `tokenStore` is.

/** Where an expired session lands, and the flag that explains why. */
const LOGIN_URL = '/login?expired=1';

/**
 * One navigation, however many requests failed.
 *
 * The dashboard fires profile, bookings and notifications together: all three
 * come back 401 within a few milliseconds of each other, and three
 * `location.replace` calls in one tick is a race, not a redirect.
 */
let leaving = false;

/**
 * Send the customer to the login screen because their session is over.
 *
 * `location.replace`, not `push`: the dead page must not sit in history where
 * the Back button returns to it. A full document load also drops every
 * module-level cache the site holds — `identity.ts` keeps the signed-in name
 * in one — which a client-side `router.replace` would leave behind.
 */
export function redirectToLogin(): void {
  if (typeof window === 'undefined' || leaving) return;

  // Already there. The login page's own requests are unauthenticated, but a
  // stale token in storage would make `loadProfile` 401 on arrival and bounce
  // the page off itself.
  if (window.location.pathname === '/login') return;

  leaving = true;
  window.location.replace(LOGIN_URL);
}

/**
 * How `api.ts` gets a fresh access token without importing `auth.ts`.
 *
 * `auth.ts` is `'use client'` and owns `tokenStore` and `refreshSession`;
 * `api.ts` runs in the server render too and may not import across that
 * boundary. So `auth.ts` hands its refresher down to this leaf at module
 * scope, and `api.ts` reaches it from here. Every module that sends a token
 * imports `./auth` for `tokenStore`, so in the browser the registration has
 * always run before an authenticated request can fail.
 */
let refresher: (() => Promise<string | null>) | null = null;

export function setSessionRefresher(fn: () => Promise<string | null>): void {
  refresher = fn;
}

/**
 * Try to save the session; eject to the login screen if it cannot be saved.
 *
 * Returns the fresh access token for the caller to retry with, or `null` when
 * the customer is on their way to `/login`.
 *
 * One refresh at a time. Parallel 401s would otherwise each POST the same
 * rotating refresh token, and rotation means the second POST is spending a
 * token the first already consumed — it would come back 401 and log out a
 * customer whose session had just been renewed successfully.
 */
let inFlight: Promise<string | null> | null = null;

export function recoverSession(): Promise<string | null> {
  inFlight ??= (refresher?.() ?? Promise.resolve(null))
    .then((token) => {
      if (!token) redirectToLogin();
      return token;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}
