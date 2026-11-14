'use client';

// The `☰` button that opens the account sidebar on a narrow screen.
//
// It replaces `components/MobileNav.tsx`, which existed for a few hours on
// 13 Nov: that one wired the demo's `#hamb` button inside the thirteen inline
// headers, and those headers are now deleted. The shared `Header` owns its own
// top-menu toggle in React state, so nothing needs wiring there.
//
// What the strip DID break is the sidebar toggle. `#menuToggle` lived in the
// dashboard's own topbar and `smoke:web-dashboard` caught its loss in the same
// run. This puts it back, once, in the shared header.
//
// **Driven by a route list, not by looking for `#sidebar` in the DOM.** The
// first version checked the DOM in an effect and tripped
// `react-hooks/set-state-in-effect` — the same rule that was right on 12 Nov.
// A list renders on the server too, so the button is in the HTML rather than
// appearing a frame later, and the smoke suite can assert it directly.

import { usePathname } from 'next/navigation';

/**
 * Routes whose markup carries `aside.sidebar#sidebar`.
 *
 * Phase 0c extends this to every account page; today these are the ones the
 * demo actually drew a sidebar on. **A page not in this list gets no button** —
 * a toggle that opens something which is not there is exactly the kind of dead
 * control this phase is removing.
 */
export const SIDEBAR_ROUTES = new Set([
  '/dashboard',
  '/profile',
  '/billing',
  '/goals',
  '/notifications',
  '/refunds',
  '/support-tickets',
  '/workout-history',
  '/workout-plans',
]);

export function SidebarToggle() {
  const pathname = usePathname();

  if (!SIDEBAR_ROUTES.has(pathname)) return null;

  return (
    <button
      className="menu-toggle"
      id="menuToggle"
      aria-label="Toggle account menu"
      aria-controls="sidebar"
      onClick={() => document.getElementById('sidebar')?.classList.toggle('open')}
    >
      ☰
    </button>
  );
}
