'use client';

// The dashboard's mobile menu toggle — all that is left of its navigation.
//
// This used to carry the demo's `gotoPage()` as well: six sidebar buttons
// swapping six `.page-panel` sections inside this one page. The client had
// that removed on 27-11-2026 — every account row is a link to a real route
// now, and the dashboard keeps Overview alone — so there are no panels left to
// switch and no `data-page` buttons to listen to.
//
// What remains is the one thing the demo shipped as inline JavaScript and that
// still has a job: below 980px the sidebar is hidden and the shared header's ☰
// opens it. `SidebarToggle` does that for the pages that render
// `AccountSidebar` on its own; this page is wrapped in the dashboard's own
// scope, so the `#menuToggle` inside it is handled here.

import { useEffect } from 'react';

/**
 * Shipped-marker, and the only reason it is a named constant.
 *
 * This component renders `null`, so nothing it does appears in the server HTML
 * — which means a smoke test cannot tell a page that has the handler from one
 * that does not. `smoke:web-dashboard` greps the page's JS bundle for this
 * exact string to prove it was built and deployed, and reads the attribute
 * below in a browser to prove it ran. Keep the literal in sync with that suite.
 */
export const NAV_MARKER = 'hf-dashboard-nav-ready';

export function DashboardNav() {
  useEffect(() => {
    const root = document.querySelector('[data-hf-page="dashboard"]');
    if (!root) return;

    // Invisible to the design, visible to a test: proof the effect ran.
    (root as HTMLElement).dataset.hfNav = NAV_MARKER;

    const sidebar = root.querySelector<HTMLElement>('#sidebar');
    const menuToggle = root.querySelector<HTMLElement>('#menuToggle');

    const onToggle = () => sidebar?.classList.toggle('open');
    menuToggle?.addEventListener('click', onToggle);

    return () => {
      menuToggle?.removeEventListener('click', onToggle);
    };
  }, []);

  return null;
}
