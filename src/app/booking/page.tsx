import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BookingWizard } from './BookingWizard';
import './page.css';

/**
 * Converted from the demo's hellofit-booking-page.html.
 * The markup and styling are the client's design; only the mechanics are React.
 *
 * The four panels and the summary are live — services, availability, the
 * customer's addresses and the server's price breakup (PDF §5.7). The shell
 * here is the design's own.
 */

export const metadata: Metadata = {
  title: "HelloFit | Book a Session",
};

export default function BookingPage() {
  return (
    <div data-hf-page="booking">
      
      

      <main>
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link> / <Link href="/my-bookings">My Bookings</Link> / <span>Booking</span></div>
          <section className="intro">
            <div>
              <div className="eyebrow">One step closer to your goal</div>
              <h1>Book your <span>session.</span></h1>
              <p>Choose your service, preferred schedule and session location. Review your details before continuing to payment.</p>
            </div>
            <div className="secure-note">♧   Secure booking experience</div>
          </section>
          <div className="steps">
            <div className="step active" id="step1"><span className="step-num">1</span><div><strong>Choose service</strong><small>Session &amp; goals</small></div></div>
            <div className="step" id="step2"><span className="step-num">2</span><div><strong>Date &amp; time</strong><small>Your schedule</small></div></div>
            <div className="step" id="step3"><span className="step-num">3</span><div><strong>Location</strong><small>Where to meet</small></div></div>
            <div className="step" id="step4"><span className="step-num">4</span><div><strong>Review</strong><small>Confirm details</small></div></div>
          </div>

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
