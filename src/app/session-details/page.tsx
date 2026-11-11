import Link from 'next/link';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SessionDetails } from './SessionDetails';
import './page.css';

/**
 * Converted from the demo's hellofit-workout-session-details-instructions.html.
 * The markup and styling are the client's design; only the mechanics are React.
 *
 * Reached as `/session-details?booking=<id>` (optionally `&session=<id>`).
 * The session facts are live; the preparation guide is the design's own copy.
 * See WorkoutGuide.tsx for the three demo blocks that are not rendered and why.
 */

export const metadata: Metadata = {
  title: "HelloFit | Session Details",
};

export default function SessionDetailsPage() {
  return (
    <div data-hf-page="session-details">
      <header><div className="shell nav"><Link className="brand" href="/"><img src="/hellofit-logo.png" alt="HelloFit logo" /><span>HelloFit</span></Link><nav className="navlinks"><Link href="/dashboard">Dashboard</Link><Link href="/my-bookings">My Bookings</Link><Link className="active" href="/session-details">Session Details</Link><Link href="/profile">My Profile</Link></nav><div className="navright"><Link className="btn soft" href="/notifications">♧ Notifications</Link></div></div></header>

      <main className="shell">
        <Suspense fallback={<section className="hero"><p>Loading your session…</p></section>}>
          <SessionDetails />
        </Suspense>
        <footer><span>© 2026 HelloFit · Your journey, your pace.</span><span><Link href="/my-bookings">All my bookings</Link></span></footer>
      </main>
    </div>
  );
}
