'use client';

// The signed-in customer's own details on the dashboard, replacing the demo's
// "Aditya Kulkarni" / "AK" / "12 / 9 / 3" literals.
//
// The fetch and the name/initials logic moved to `src/lib/identity.ts` when
// the avatar menu needed the same values in the topbar of fifteen pages. What
// is left here is only what the dashboard draws.
//
// What is NOT here, and why:
//
// * **"Member since"** — `ApiProfile` carries no `createdAt`, so there is no
//   truthful value to show. The label stays, the date is UNKNOWN.
// * **Saved trainers** — needs a favourites table, which does not exist and is
//   not in the v3 PDF.
// * **The monthly goal target** — needs goals/progress, also absent.
//
// A dash is the honest answer for "we do not know this yet". Inventing a
// number, or deleting the client's tile, would both be worse.

import { useSyncExternalStore } from 'react';
import {
  GREETINGS,
  greetingBand,
  SERVER_GREETING_BAND,
} from '@/lib/greeting';
import { UNKNOWN, useIdentity } from '@/lib/identity';

/**
 * The band changes only when the hour does, which no page view outlives in a
 * way worth re-rendering for. Subscribing to nothing keeps the snapshot honest
 * without a timer.
 */
const NO_CHANGES = () => () => {};

export function LiveGreeting() {
  // The demo said "Good morning ☀️" at every hour of the day. It now follows
  // the reader's clock — `lib/greeting.ts` holds the bands so any other
  // surface greets identically.
  //
  // `useSyncExternalStore` rather than `useState` + `useEffect`: the clock is
  // outside React, the server cannot know the reader's hour, and this is the
  // API that lets the server render one value and the client correct it
  // without a hydration warning. The snapshot is a *number* on purpose —
  // returning a fresh `{ text, icon }` each render would never settle.
  const band = useSyncExternalStore(
    NO_CHANGES,
    () => greetingBand(),
    () => SERVER_GREETING_BAND,
  );
  const { text, icon } = GREETINGS[band]!;

  return (
    <h1>
      {text}, {useIdentity().name} <span>{icon}</span>
    </h1>
  );
}

export function LiveUserMini() {
  const { name, initials } = useIdentity();
  return (
    <div className="user-mini">
      <div className="user-pic">{initials}</div>
      <div>
        <strong>{name}</strong>
        {/* No createdAt on the profile, so the date is unknown, not invented. */}
        <small>Member since {UNKNOWN}</small>
      </div>
    </div>
  );
}

/**
 * The monthly-goal card, with the one true number in it and nothing else.
 *
 * The demo asserted "Complete 12 sessions · 75% · 3 more to go". Sessions
 * completed is real and comes from the bookings API; **the target does not
 * exist** — there is no goals table and "goal" appears nowhere in the v3 PDF
 * (audit item 19). So the target, the percentage and the progress bar are
 * blank, and the sentence no longer claims a target the customer never set.
 *
 * The demo's overview copy carried a "Book next session" button under the
 * card (`withCta`). **Removed 23-11-2026 on the client's word** — "Book a
 * session" already sits at the top of the same panel, so the second button
 * was a duplicate. Both panels now draw the same card, so the prop is gone
 * with it; `.goal-cta` stays in `page.css` as converted demo styling.
 */
export function LiveGoalCard() {
  const { completed } = useIdentity();

  return (
    <div className="goal-card">
      <div className="goal-title"><strong>Sessions completed</strong><span>{completed}</span></div>
      <p>Session goals are not set up on your account yet.</p>
      <div className="progress"><span style={{ width: 0 }}></span></div>
      <div className="goal-meta"><span>{completed} completed</span><span>No goal set</span></div>
    </div>
  );
}

export function LiveStats() {
  const { total, completed } = useIdentity();
  return (
    <div className="stats">
      <div className="stat">
        <div className="stat-icon">▦</div>
        <div><small>Total sessions</small><strong>{total}</strong></div>
      </div>
      <div className="stat">
        <div className="stat-icon">✦</div>
        <div><small>Sessions completed</small><strong>{completed}</strong></div>
      </div>
      <div className="stat">
        <div className="stat-icon">♡</div>
        {/* Favourites have no backend — see the file comment. */}
        <div><small>Saved trainers</small><strong id="savedCount">{UNKNOWN}</strong></div>
      </div>
    </div>
  );
}
