'use client';

// Who is signed in, and the two counts derived from their bookings.
//
// Lifted out of the dashboard when the avatar menu moved into the topbar of
// every page: both need the same name and initials, and the dashboard needs
// the session counts as well. One module, one fetch.
//
// The cache is module-level with a subscriber set rather than React context,
// because the consumers are scattered through converted markup on fifteen
// separate pages — wrapping each page in a provider would mean editing all of
// them for something a module already does. It resets on navigation only
// insofar as the module is re-evaluated; within a page view, five components
// share one pair of requests.

import { useSyncExternalStore } from 'react';
import { loadProfile } from './profile';
import { getMyBookings } from './bookings';
import { isSignedIn } from './auth';

/** No value yet — not zero, which would be a claim. */
export const UNKNOWN = '—';

export interface Identity {
  name: string;
  initials: string;
  total: string;
  completed: string;
  /** False until the fetch resolves, so the menu can offer Log in instead. */
  signedIn: boolean;
  /**
   * Whether `signedIn` is an answer or merely the not-yet-known default.
   *
   * The server render and the first client render both read `signedIn` as
   * false, which is why the avatar cannot be gated on it alone — a
   * `signedIn ? … : null` strips the avatar from the server HTML of every
   * signed-in page, which is exactly what smoke:web-logout catches. `ready`
   * stays false through both of those renders and flips once `load()` has
   * actually decided, so a consumer can tell "nobody is signed in" apart from
   * "nobody has looked yet".
   */
  ready: boolean;
}

const EMPTY: Identity = {
  name: UNKNOWN,
  initials: UNKNOWN,
  total: UNKNOWN,
  completed: UNKNOWN,
  signedIn: false,
  ready: false,
};

/** `Aarohi Rao` → `AR`; `Aarohi` → `A`. Matches the demo's own initials. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return UNKNOWN;
  return parts.slice(0, 2).map((p) => p[0]!.toUpperCase()).join('');
}

let cache: Identity | null = null;
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function publish(value: Identity) {
  cache = value;
  listeners.forEach((fn) => fn());
}

async function load() {
  // No token means no request at all: the API would 401 and the page would
  // log a failure for something that is simply "nobody is signed in".
  if (!isSignedIn()) {
    publish({ ...EMPTY, signedIn: false, ready: true });
    return;
  }

  const [profile, bookings] = await Promise.all([loadProfile(), getMyBookings()]);

  const name = profile.form
    ? [profile.form.firstName, profile.form.lastName].filter(Boolean).join(' ').trim()
    : '';

  const rows = bookings.bookings;

  publish({
    name: name || UNKNOWN,
    initials: name ? initialsOf(name) : UNKNOWN,
    total: String(rows.length),
    completed: String(rows.filter((b) => b.status === 'completed').length),
    signedIn: !profile.unauthorised,
    ready: true,
  });
}

/** One load per page view, however many components ask for it. */
function ensureLoaded() {
  if (cache) return;
  inFlight ??= load().finally(() => {
    inFlight = null;
  });
}

/**
 * Read again after signing in, discarding whatever is cached.
 *
 * **Without this the name only appeared after a manual refresh.** The login
 * page's own header asks for the identity, gets "nobody is signed in" and
 * caches it. Signing in then navigates client-side, so the module is never
 * re-evaluated and `ensureLoaded`'s `if (cache) return` hands the dashboard
 * that same signed-out answer — a dash where the name should be. Only a full
 * reload cleared it.
 *
 * The cache is replaced rather than nulled first, so the name does not blink
 * through `—` on the way.
 */
export function refreshIdentity(): void {
  inFlight = load().finally(() => {
    inFlight = null;
  });
}

/** Drop the cache after signing out, so the next read is not a stale name. */
export function forgetIdentity() {
  cache = null;
  // `ready: true` — a logout is an answer, not an absence of one, so the
  // avatar must go straight away rather than linger until something reloads.
  publish({ ...EMPTY, signedIn: false, ready: true });
}

/**
 * `useSyncExternalStore`, not `useState` + `useEffect`.
 *
 * This is React's own API for exactly this shape — a module-level store read
 * by many components — and it avoids the bug the naive version has: a fetch
 * that resolves between first render and the effect running would otherwise be
 * missed, and catching it with a `setState` inside the effect is what
 * `react-hooks/set-state-in-effect` rightly refuses. `getSnapshot` is read on
 * every render instead, so late arrivals cannot be lost.
 *
 * `EMPTY` is a stable module constant, which matters: returning a fresh object
 * from `getSnapshot` would re-render forever.
 */
const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  ensureLoaded();
  return () => {
    listeners.delete(onChange);
  };
};

const getSnapshot = (): Identity => cache ?? EMPTY;

export function useIdentity(): Identity {
  // The server render has no localStorage and so no identity — the dash and
  // the "Log in" item are the correct server-side answer.
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
