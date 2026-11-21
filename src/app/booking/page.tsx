import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BookingWizard } from './BookingWizard';
import './page.css';

/**
 * Converted from the demo's hellofit-booking-page.html.
 * The markup and styling are the client's design; only the mechanics are React.
 *
 * The four panels and the summary are live — the chosen service and package,
 * availability, the customer's addresses and the server's price breakup
 * (PDF §5.7). The shell here is the design's own.
 *
 * **The step strip moved into `BookingWizard` on 21 Nov 2026.** It was static
 * markup in this file with `active` hard-coded on step 1, so it could never
 * follow the customer — which is what the client saw as the date-and-time
 * screen sitting inside the choose-service tab. It is now the page's tab
 * control, so it has to live beside the state it reflects.
 */

export const metadata: Metadata = {
  title: 'HelloFit | Book a Session',
};

export default function BookingPage() {
  return (
    <div data-hf-page="booking">
      <main>
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link> / <Link href="/my-bookings">My Bookings</Link> /{' '}
            <span>Booking</span>
          </div>

          <section className="intro">
            <div>
              <div className="eyebrow">One step closer to your goal</div>
              <h1>
                Book your <span>session.</span>
              </h1>
              <p>
                Confirm your service and package, choose a date and start time, and tell us
                where your trainer should come.
              </p>
            </div>
            <div className="secure-note">♧ Secure booking experience</div>
          </section>

          {/* Suspense because BookingWizard reads ?service= via useSearchParams,
              which Next refuses to prerender without a boundary. */}
          <Suspense fallback={<p className="muted">Loading the booking form…</p>}>
            <BookingWizard />
          </Suspense>
        </div>
      </main>

      <div className="toast" id="toast" role="status" aria-live="polite"></div>
    </div>
  );
}
