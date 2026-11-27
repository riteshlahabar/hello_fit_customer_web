// The account sidebar — now the only one, on every signed-in page.
//
// It used to serve Billing and Refunds while the dashboard drew its own copy
// whose rows switched panels inside that single page. That split is what made
// My Bookings behave differently depending on which menu you came from, so the
// client had it removed (27-11-2026): every row here is a real link to a real
// route, the dashboard renders this component like everything else, and no
// account page opens without a sidebar.
//
// Its CSS is **unscoped and self-contained** (`account-sidebar.css`) because
// each converted page scopes its own rules to `[data-hf-page="…"]`; borrowing
// the dashboard's scope here would drag in the rest of the dashboard's styles.

import Link from 'next/link';
import { AccountUserMini } from './AccountUserMini';
import './account-sidebar.css';

const SPACE = [
  // "Overview" renamed on the client's word, 27-11-2026: the row leads to the
  // page everything else calls the dashboard, and two names for it confused.
  ['/dashboard', '⌂', 'Dashboard'],
  ['/my-bookings', '▦', 'My Bookings'],
  ['/saved-trainers', '♡', 'Saved Trainers'],
  ['/goals', '◎', 'Fitness Goals'],
];

const ACCOUNT = [
  ['/profile', '♙', 'My Profile'],
  // Lifted out of the profile page's own tab strip (client, 27-11-2026).
  // `/notifications` already existed and is already wired to the API; the two
  // other notification panels on the site were dead copies and are deleted.
  ['/notifications', '♧', 'Notifications'],
  ['/billing', '🧾', 'Billing History'],
  ['/refunds', '↩', 'Refunds'],
];

export function AccountSidebar({ current }: { current: string }) {
  const row = ([href, icon, label]: string[]) => (
    <Link
      key={href}
      className={`hf-nav-btn${href === current ? ' active' : ''}`}
      href={href!}
    >
      <span className="hf-ico">{icon}</span> {label}
    </Link>
  );

  return (
    <aside className="hf-account-sidebar" id="sidebar">
      <AccountUserMini />
      <div className="hf-nav-label">YOUR SPACE</div>
      {SPACE.map(row)}
      <div className="hf-nav-label">ACCOUNT</div>
      {ACCOUNT.map(row)}
      <div className="hf-sidebar-bottom">
        <strong>Ready for your next session?</strong>
        <p>Find a trainer who fits your goals and schedule.</p>
        <Link className="hf-text-link" href="/find-a-trainer">
          Explore trainers →
        </Link>
      </div>
    </aside>
  );
}
