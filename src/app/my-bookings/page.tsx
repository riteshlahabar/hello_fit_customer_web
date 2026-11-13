import Link from 'next/link';
import { AvatarMenu } from '@/components/AvatarMenu';
import type { Metadata } from 'next';
import { MyBookings } from './MyBookings';
import './page.css';

/**
 * Converted from the demo's hellofit-my-bookings.html.
 * The markup and styling are the client's design; only the mechanics are React.
 */

export const metadata: Metadata = {
  title: "HelloFit | My Bookings",
};

export default function MyBookingsPage() {
  return (
    <div data-hf-page="my-bookings">
      <div className="shell"><header className="topbar"><Link className="brand" href="/"><img src="/hellofit-logo.png" alt="HelloFit logo" /><span>Hello<b>Fit</b></span></Link><nav className="toplinks"><Link href="/">Home</Link><Link href="/find-a-trainer">Find a Trainer</Link><Link href="/dashboard">Dashboard</Link><Link href="/profile">My Profile</Link></nav><div className="userchip"><AvatarMenu /><div><strong style={{ display: "block", fontSize: "12px" }}>Sam Patel</strong><span style={{ fontSize: "10px", color: "#888" }}>Customer account</span></div><span className="mobile-menu">☰</span></div></header><main className="wrap"><div className="crumb"><Link href="/">Home</Link> / <Link href="/dashboard">My Account</Link> / <span>My Bookings</span></div><section className="heading"><div><div className="eyebrow">Your fitness journey</div><h1>MY BOOKINGS<span style={{ color: "var(--orange)" }}>.</span></h1><p>Every session, every milestone — all in one place.</p></div><Link className="btn btn-primary" href="/find-a-trainer">＋ Book a new session</Link></section><MyBookings /><div className="footer-note">HelloFit · Securely manage your fitness sessions</div></main></div><div className="modal-backdrop" id="modalBackdrop"><div className="modal"><h2 id="modalTitle">Booking details</h2><p id="modalBody"></p><div className="modal-actions"><button className="btn btn-light" id="modalClose">Close</button><button className="btn btn-primary" id="modalConfirm">Confirm</button></div></div></div><div className="toast" id="toast"></div>
    </div>
  );
}
