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

import { UNKNOWN, useIdentity } from '@/lib/identity';

export function LiveGreeting() {
  // The demo's wording and the sun, kept; only the name is live.
  return (
    <h1>
      Good morning, {useIdentity().name} <span>☀️</span>
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
 * `withCta` is the overview copy, which carries a "Book next session" button;
 * the Fitness Goals panel shows the same card without it. Both were separate
 * hardcoded blocks in the demo.
 */
export function LiveGoalCard({ withCta = false }: { withCta?: boolean }) {
  const { completed } = useIdentity();

  return (
    <div className="goal-card">
      <div className="goal-title"><strong>Sessions completed</strong><span>{completed}</span></div>
      <p>Session goals are not set up on your account yet.</p>
      <div className="progress"><span style={{ width: 0 }}></span></div>
      <div className="goal-meta"><span>{completed} completed</span><span>No goal set</span></div>
      {withCta && (
        <div className="goal-cta">
          <button className="primary" id="goalBook">Book next session</button>
        </div>
      )}
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
