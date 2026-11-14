import Link from 'next/link';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Confirmed } from './Confirmed';
import './page.css';

/**
 * Converted from the demo's hellofit-booking-confirmed.html.
 * The markup and styling are the client's design; only the mechanics are React.
 *
 * Reached as `/booking-confirmed?booking=<id>` from checkout. The card reads
 * the booking back from the server, so the reference, the status and the
 * amounts are the recorded ones (PDF §5.7, §5.8).
 */

export const metadata: Metadata = {
  title: "HelloFit | Booking Confirmed",
};

export default function BookingConfirmedPage() {
  return (
    <div data-hf-page="booking-confirmed">
      
      

      <main className="hero">
        <div className="container">
          <div className="crumb"><Link href="/">Home</Link>  /  Booking confirmation</div>
          <div className="success-wrap">
            <Suspense fallback={<section className="success-card"><div className="card-body"><div className="section-title">Loading…</div></div></section>}>
              <Confirmed />
            </Suspense>

            <div className="next-steps">
              <div className="step"><div className="n">01</div><strong>Check your details</strong><p>Keep your booking ID handy in case you need help with this session.</p></div>
              <div className="step"><div className="n">02</div><strong>Get session-ready</strong><p>Wear comfortable clothing and keep a mat and water bottle nearby.</p></div>
              <div className="step"><div className="n">03</div><strong>Stay in the loop</strong><p>Session updates appear in your notifications and are sent to your registered contact.</p></div>
            </div>
          </div>
        </div>
      </main>

      
      <div className="toast" id="toast" role="status" aria-live="polite">Copied!</div>
    </div>
  );
}
