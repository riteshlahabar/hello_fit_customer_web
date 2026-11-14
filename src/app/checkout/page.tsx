import Link from 'next/link';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Checkout } from './Checkout';
import './page.css';

/**
 * Converted from the demo's hellofit-checkout-payment.html.
 * The markup and styling are the client's design; only the mechanics are React.
 *
 * The payment flow is live (PDF §5.8): the server prices the booking, the
 * gateway collects, and the server verifies before anything is confirmed.
 */

export const metadata: Metadata = {
  title: "HelloFit | Checkout & Payment",
};

export default function CheckoutPage() {
  return (
    <div data-hf-page="checkout">
      
      

      <main>
        <div className="container">
          <div className="checkout-hero">
            <div className="breadcrumb"><Link href="/">Home</Link> / <Link href="/booking">Booking</Link> / <span>Checkout &amp; Payment</span></div>
            <div className="eyebrow">Almost there</div>
            <h1>SECURE YOUR <span>SESSION.</span></h1>
            <p>Review your HelloFit booking, choose how to pay, and get ready to move.</p>
            <div className="progress">
              <div className="progress-step done"><b>✓</b> Booking details</div>
              <div className="progress-line"></div>
              <div className="progress-step active"><b>2</b> Payment</div>
              <div className="progress-line"></div>
              <div className="progress-step"><b>3</b> Confirmation</div>
              <span className="secure-pill">▣ Secure checkout</span>
            </div>
          </div>

          <Suspense fallback={<p className="muted">Loading your booking…</p>}>
            <Checkout />
          </Suspense>
        </div>
      </main>

      <div className="toast" id="toast" role="status" aria-live="polite"></div>
      
    </div>
  );
}
