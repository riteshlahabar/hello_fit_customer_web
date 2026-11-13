'use client';

import Link from 'next/link';
import { AvatarMenu } from '@/components/AvatarMenu';
import './page.css';
import { NoticeList } from './NoticeList';
import { ChannelPrefs } from './ChannelPrefs';
import { UpcomingCard } from './UpcomingCard';

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
      <div className="topbar"><span>Move better. Feel stronger. Live HelloFit.</span><span><Link href="/help">Need help?</Link>  ·  Customer portal</span></div>
      <header className="header"><Link className="brand" href="/" aria-label="HelloFit home"><img src="/hellofit-logo.png" alt="HelloFit logo" /><span>HelloFit<small>YOUR FITNESS, YOUR WAY</small></span></Link><nav className="nav"><Link href="/">Home</Link><Link href="/find-a-trainer">Find a Trainer</Link><Link href="/my-bookings">My Bookings</Link><Link href="/dashboard">Dashboard</Link><Link className="active" href="/notifications">Notifications</Link></nav><div className="header-actions"><span className="icon-btn" aria-hidden="true">♧<i className="dot"></i></span><AvatarMenu /></div></header>

      <main className="container">
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
      </main>

      <footer className="footer"><div><strong>HelloFit</strong> <span>— Your fitness, your way.</span></div><div><Link href="/">Home</Link><Link href="/my-bookings">Bookings</Link><Link href="/help">Support</Link></div></footer>
      <div className="toast" id="toast" role="status" aria-live="polite"></div>
    </div>
  );
}
