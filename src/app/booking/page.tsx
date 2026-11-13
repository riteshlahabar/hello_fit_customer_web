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
      <div className="announcement">YOUR FITNESS JOURNEY STARTS HERE <b>· FIND YOUR FIT WITH HELLOFIT</b></div>
      <header><div className="container nav"><Link className="brand" href="/"><img src="/hellofit-logo.png" alt="HelloFit logo" /><span className="brand-text"><strong>HELLOFIT</strong><small>Your time, Your Place</small></span></Link><nav className="nav-links" id="navLinks"><Link href="/">Home</Link><Link href="/find-a-trainer">Find a Trainer</Link><Link href="/#categories">Categories</Link><Link href="/#how">How It Works</Link><Link href="/#about-hellofit">About</Link><a href="#footer">Contact</a></nav><div className="nav-actions"><Link className="btn outline login" href="/login">Login</Link><Link className="btn primary" href="/login">Sign Up</Link><button className="hamb" id="hamb" aria-label="Toggle navigation">☰</button></div></div></header>

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

      <footer id="footer"><div className="container"><div className="footer-grid"><div className="footer-brand"><Link className="brand" href="/"><img src="/hellofit-logo.png" alt="HelloFit logo" /><span className="brand-text"><strong>HELLOFIT</strong><small>Your time, Your Place</small></span></Link><p>Your fitness, your way. Find a professional and make movement fit your life.</p></div><div className="footer-col"><h4>Explore</h4><Link href="/">Home</Link><Link href="/find-a-trainer">Find a Trainer</Link><Link href="/#categories">Categories</Link><Link href="/#how">How It Works</Link></div><div className="footer-col"><h4>Support</h4><a href="#footer">Help Center</a><a href="#footer">Terms &amp; Conditions</a><a href="#footer">Privacy Policy</a><a href="#footer">Contact Us</a></div><div className="footer-col"><h4>For Professionals</h4><a href="#footer">Become a Trainer</a><a href="#footer">Provider Help</a><a href="#footer">FAQs</a></div></div><div className="footer-bottom"><span>© 2026 HelloFit. All rights reserved.</span><span>Your time, Your Place.</span></div></div></footer>
      <div className="toast" id="toast" role="status" aria-live="polite"></div>
    </div>
  );
}
