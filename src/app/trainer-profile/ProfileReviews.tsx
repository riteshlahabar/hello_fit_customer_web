// The Reviews tab — PDF §5.6 ("ratings and reviews where available").
//
// The demo hard-coded a 4.9, "120 sample reviews", bars at 88/9/2/1% and two
// invented customers with stock-photo avatars. All of it comes from
// `GET /instructors/:id/reviews` now, which returns the real `RatingAggregate`
// plus the published reviews.
//
// Two honest departures from the design:
//
//   * **No avatars.** `Review` carries no reviewer photo and `CustomerProfile`
//     has no photo column at all, so the demo's `<img>` would have to be a
//     stock face attached to a real customer's words. The initial in a circle
//     is drawn with the same `.review-user` markup instead.
//   * **The bars are counts, not invented percentages.** A provider with four
//     reviews shows four; `distribution` is keyed by star.

import { shortDate } from '@/lib/billing';
import type { ProviderReviewsPayload } from '@/lib/provider-profile';
import { starRow } from './bits';

const STARS = ['5', '4', '3', '2', '1'];

export function ProfileReviews({
  payload,
}: {
  payload: ProviderReviewsPayload | null;
}) {
  const reviews = payload?.reviews ?? [];
  const count = payload?.aggregate.ratingCount ?? 0;
  const average = Number(payload?.aggregate.ratingAvg ?? 0);
  const distribution = payload?.aggregate.distribution ?? {};

  if (!payload || count === 0) {
    return (
      <>
        <h2>Client reviews</h2>
        <p>
          This trainer has no published reviews yet. Reviews appear here once
          customers have completed sessions and rated them.
        </p>
      </>
    );
  }

  return (
    <>
      <h2>Client reviews</h2>

      <div className="review-summary">
        <div className="big-rating">
          {average.toFixed(1)}{' '}
          <small>
            <span className="stars">{starRow(average)}</span>
            <br />
            {count} review{count === 1 ? '' : 's'}
          </small>
        </div>
        <div className="rating-bars">
          {STARS.map((star) => {
            const value = distribution?.[star] ?? 0;
            const width = count > 0 ? Math.round((value / count) * 100) : 0;

            return (
              <div className="rating-row" key={star}>
                <span>{star} ★</span>
                <div className="bar">
                  <i style={{ width: `${width}%` }} />
                </div>
                <span>{value}</span>
              </div>
            );
          })}
        </div>
      </div>

      {reviews.map((review) => (
        <div className="review-item" key={review.id}>
          <div className="review-user">
            <span className="hf-review-initial" aria-hidden="true">
              ★
            </span>
            <div>
              <strong>Verified customer</strong>
              <small>
                {review.publishedAt ? shortDate(review.publishedAt) : 'Recent'}
              </small>
            </div>
          </div>
          <div className="stars">{starRow(review.overallRating)}</div>
          {review.comment ? <p>“{review.comment}”</p> : null}
          {review.criteriaScores.length ? (
            <div className="specialties">
              {review.criteriaScores.map((score) => (
                <span key={score.criteria.slug}>
                  {score.criteria.name} {score.score}/5
                </span>
              ))}
            </div>
          ) : null}
          {review.reply ? (
            <p>
              <strong>Trainer’s reply:</strong> {review.reply}
            </p>
          ) : null}
        </div>
      ))}
    </>
  );
}
