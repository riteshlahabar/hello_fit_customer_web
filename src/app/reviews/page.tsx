import Link from 'next/link';
import type { Metadata } from 'next';
import { ReviewsBoard } from './ReviewsBoard';
import './page.css';

/**
 * Converted from the demo's hellofit-reviews-ratings.html.
 * The markup and styling are the client's design; only the mechanics are React.
 *
 * The scorecard, the write-a-review form and the review list are live
 * (`/app/customer/reviews/*`). The shell below is the design's own.
 */

export const metadata: Metadata = {
  title: "HelloFit | Reviews & Ratings",
};

export default function ReviewsPage() {
  return (
    <div data-hf-page="reviews">
      

      <main className="wrap">
        <div className="crumb"><Link href="/">Home</Link> / <Link href="/dashboard">My Account</Link> / <span>Reviews &amp; Ratings</span></div>
        <section className="hero">
          <div>
            <div className="eyebrow">Share your experience</div>
            <h1>REVIEWS &amp; RATINGS<span style={{ color: "var(--orange)" }}>.</span></h1>
            <p>Your feedback helps trainers grow and helps others find their perfect fit.</p>
          </div>
        </section>

        <ReviewsBoard />

        <div className="footnote">HelloFit · Reviews appear once the moderation rules allow it.</div>
      </main>
      <div className="toast" id="toast"></div>
    </div>
  );
}
