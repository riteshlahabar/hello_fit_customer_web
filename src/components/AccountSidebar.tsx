// The account sidebar, for the pages that are their own route.
//
// The dashboard draws this sidebar itself, and its buttons switch panels
// inside that one page (`DashboardNav`). Billing and Refunds are separate
// routes, so clicking through to them used to leave the sidebar behind — this
// keeps it on screen, with every row a real link.
//
// Its CSS is **unscoped and self-contained** (`account-sidebar.css`) because
// each converted page scopes its own rules to `[data-hf-page="…"]`; borrowing
// the dashboard's scope here would drag in the rest of the dashboard's styles.

import Link from 'next/link';
import { AccountUserMini } from './AccountUserMini';
import './account-sidebar.css';

const SPACE = [
  ['/dashboard', '⌂', 'Overview'],
  ['/my-bookings', '▦', 'My Bookings'],
  ['/saved-trainers', '♡', 'Saved Trainers'],
  ['/goals', '◎', 'Fitness Goals'],
];

const ACCOUNT = [
  ['/profile', '♙', 'My Profile'],
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
