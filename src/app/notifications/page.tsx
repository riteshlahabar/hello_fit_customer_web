'use client';

import Link from 'next/link';
import './page.css';
import { NoticeList } from './NoticeList';
import { ChannelPrefs } from './ChannelPrefs';
import { UpcomingCard } from './UpcomingCard';
import { AccountSidebar } from '@/components/AccountSidebar';

/**
 * Converted from the demo's hellofit-notifications-reminders.html.
 * The markup and styling are the client's design; only the mechanics are React.
 *
 * The notice list, the channel preferences and the upcoming-session card are
 * live (`/app/notifications`, its `preferences` route, and the customer's own
 * bookings). The hero, quick links and footer are the design's own copy.
 *
 * Note for the client: PDF §5 does not name a website notifications page —
 * §3.9 covers notifications in the apps. This page exists because the design
 * ships it, and it is wired to the endpoint the apps already use.
 */

export default function NotificationsPage() {
  return (
    <div data-hf-page="notifications">
      
      

      <main className="container"><div className="hf-account-shell"><AccountSidebar current="/notifications" /><div className="hf-account-main">
        <div className="breadcrumb">Home / Customer Area / <b>Notifications &amp; Reminders</b></div>
        <section className="hero">
          <div>
            <div className="eyebrow">Stay in the loop</div>
            <h1>NOTIFICATIONS &amp;<br />REMINDERS</h1>
            <p>Your fitness journey has a lot of little wins. Keep track of booking updates, upcoming sessions, payment activity and offers — all in one place.</p>
          </div>
          <div className="hero-art"><span>🔔</span></div>
        </section>

        <div className="layout">
          <NoticeList />
          <aside>
            <ChannelPrefs />
            <UpcomingCard />
            <section className="card"><div className="card-head"><div><h2>Quick links</h2><div className="sub">Manage your HelloFit account</div></div></div><div className="settings-section"><div className="setting-row"><div className="setting-left"><div className="setting-ico">▤</div><div><div className="setting-title">My bookings</div><div className="setting-desc">View, reschedule or cancel sessions</div></div></div><Link href="/my-bookings" style={{ color: "var(--orange)", textDecoration: "none", fontWeight: "700" }}>→</Link></div><div className="setting-row"><div className="setting-left"><div className="setting-ico">☏</div><div><div className="setting-title">Help &amp; support</div><div className="setting-desc">Get help with your account</div></div></div><Link href="/help" style={{ color: "var(--orange)", textDecoration: "none", fontWeight: "700" }}>→</Link></div><div className="setting-row"><div className="setting-left"><div className="setting-ico">⚙</div><div><div className="setting-title">Account settings</div><div className="setting-desc">Update your profile preferences</div></div></div><Link href="/profile" style={{ color: "var(--orange)", textDecoration: "none", fontWeight: "700" }}>→</Link></div></div></section>
          </aside>
        </div>
      </div></div></main>

      
      <div className="toast" id="toast" role="status" aria-live="polite"></div>
    </div>
  );
}
