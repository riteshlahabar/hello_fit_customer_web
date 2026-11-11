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
      <div className="announcement">YOUR FITNESS JOURNEY STARTS HERE <b>· FIND YOUR FIT WITH HELLOFIT</b></div>
      <header><div className="container nav"><Link className="brand" href="/"><img src="/hellofit-logo.png" alt="HelloFit logo" /><span className="brand-text"><strong>HELLOFIT</strong><small>Your time, Your Place</small></span></Link><nav className="nav-links" id="navLinks"><Link href="/">Home</Link><Link href="/find-a-trainer">Find a Trainer</Link><Link href="/#categories">Categories</Link><Link href="/#how">How It Works</Link><Link href="/#about-hellofit">About</Link><a href="#footer">Contact</a></nav><div className="nav-actions"><Link className="btn outline login" href="/profile">My account</Link><Link className="btn primary" href="/my-bookings">My bookings</Link><button className="hamb" id="hamb" aria-label="Toggle navigation">☰</button></div></div></header>

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
      <footer id="footer"><div className="container"><div className="footer-grid"><div className="footer-brand"><Link className="brand" href="/"><img src="/hellofit-logo.png" alt="HelloFit logo" /><span className="brand-text"><strong>HELLOFIT</strong><small>Your time, Your Place</small></span></Link><p>Your fitness, your way. Find a professional and make movement fit your life.</p></div><div className="footer-col"><h4>Explore</h4><Link href="/">Home</Link><Link href="/find-a-trainer">Find a Trainer</Link><Link href="/#categories">Categories</Link><Link href="/#how">How It Works</Link></div><div className="footer-col"><h4>Support</h4><a href="#footer">Help Center</a><a href="#footer">Terms &amp; Conditions</a><a href="#footer">Privacy Policy</a><a href="#footer">Contact Us</a></div><div className="footer-col"><h4>For Professionals</h4><a href="#footer">Become a Trainer</a><a href="#footer">Provider Help</a><a href="#footer">FAQs</a></div></div><div className="footer-bottom"><span>© 2026 HelloFit. All rights reserved.</span><span>Your time, Your Place.</span></div></div></footer>
    </div>
  );
}
