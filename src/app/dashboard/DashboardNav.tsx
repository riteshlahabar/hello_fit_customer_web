'use client';

// The dashboard's sidebar navigation and mobile menu.
//
// These existed in the demo as inline JavaScript (`gotoPage()` plus a
// `#menuToggle` listener) and were the one part of that page never converted —
// so every sidebar button did nothing at all, and on mobile the menu would not
// open. This restores exactly that behaviour and adds nothing: the markup,
// the classes, the ids and the `data-page` attributes are all the client's.
//
// It works through the DOM rather than React state on purpose. The page is a
// server component whose body is one large block of converted markup; lifting
// six panels and six buttons into state would mean rewriting all of it, and
// the design's own CSS already does the showing and hiding —
// `.page-panel{display:none}` / `.page-panel.active{display:block}`. So the
// only thing missing was the class toggle, which is what this does.
//
// The demo's `gotoPage()` also called `renderAllBookings()` and
// `renderSaved()`, which filled two panels with its sample rows. Those are
// deliberately NOT reproduced: the bookings panel duplicates `/my-bookings`,
// which reads the live API, and saved trainers has no backend at all (a
// favourites table appears nowhere in the v3 PDF). Inventing rows here would
// put fake data back on a page we are trying to make real.

import { useEffect } from 'react';

/**
 * Shipped-marker, and the only reason it is a named constant.
 *
 * This component renders `null`, so nothing it does appears in the server HTML
 * — which means a smoke test cannot tell a page that has the navigation from
 * one that does not. `smoke:web-dashboard` greps the page's JS bundle for this
 * exact string to prove the handler was actually built and deployed, and reads
 * the attribute below in a browser to prove it ran. Keep the literal in sync
 * with that suite.
 */
export const NAV_MARKER = 'hf-dashboard-nav-ready';

export function DashboardNav() {
  useEffect(() => {
    const root = document.querySelector('[data-hf-page="dashboard"]');
    if (!root) return;

    // Invisible to the design, visible to a test: proof the effect ran.
    (root as HTMLElement).dataset.hfNav = NAV_MARKER;

    const panels = Array.from(root.querySelectorAll<HTMLElement>('.page-panel'));
    const buttons = Array.from(root.querySelectorAll<HTMLElement>('.nav-btn'));
    const sidebar = root.querySelector<HTMLElement>('#sidebar');
    const menuToggle = root.querySelector<HTMLElement>('#menuToggle');

    // The demo's gotoPage(), unchanged in behaviour.
    const gotoPage = (page: string) => {
      panels.forEach((p) => p.classList.toggle('active', p.id === `page-${page}`));
      buttons.forEach((b) => b.classList.toggle('active', b.dataset.page === page));
      sidebar?.classList.remove('open');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const onNav = (event: Event) => {
      const page = (event.currentTarget as HTMLElement).dataset.page;
      if (page) gotoPage(page);
    };

    const onToggle = () => sidebar?.classList.toggle('open');

    buttons.forEach((b) => b.addEventListener('click', onNav));
    menuToggle?.addEventListener('click', onToggle);

    // The sidebar's "Explore trainers" and the overview's booking buttons were
    // separate demo handlers; they are left alone here so this component owns
    // one thing only.

    return () => {
      buttons.forEach((b) => b.removeEventListener('click', onNav));
      menuToggle?.removeEventListener('click', onToggle);
    };
  }, []);

  return null;
}
