'use client';

// Reviews — PDF §5.10 / US-W11: "rate an eligible completed service", with
// submission limited to eligible bookings and display following the
// configured moderation rules.
//
// Both of those are the API's rules, not this file's:
//
// - **Eligibility** is `/app/customer/reviews/pending` — completed sessions
//   inside the review window with no review from this side yet. The form
//   offers those and nothing else, so an ineligible review cannot be typed.
// - **Moderation** is `state` on each row. A review is stored hidden and
//   published by the double-blind rule, so "awaiting publication" is a real
//   state the page shows rather than a pretence that it is live.
//
// The design's two text inputs (headline, review) meet one `comment` column.
// They are joined with a blank line on the way out and split back on the way
// in — lossless, and it keeps the design's two fields.

import { apiGetResult, apiSend } from './api';
import { tokenStore } from './auth';

export interface Criterion {
  id: string;
  name: string;
  slug: string;
  isMandatory: boolean;
}

export interface PendingSession {
  id: string;
  sessionDate: string;
  service: string;
  trainer: string;
  trainerId: string;
  bookingCode: string;
}

export interface MyReview {
  id: string;
  rating: number;
  headline: string;
  body: string;
  trainer: string;
  service: string;
  date: string;
  /** PUBLISHED, HELD, HIDDEN … — the moderation state, shown as a label. */
  state: string;
  published: boolean;
  reply: string | null;
}

interface ApiPending {
  id: string;
  sessionDate: string;
  service: { name: string } | null;
  instructor: { id: string; name: string } | null;
  booking: { code: string } | null;
}

interface ApiMine {
  id: string;
  overallRating: number;
  comment: string | null;
  state: string;
  publishedAt: string | null;
  reply: string | null;
  session: {
    sessionDate: string;
    service: { name: string } | null;
    instructor: { name: string } | null;
  } | null;
}

/** `headline\n\nbody` → `[headline, body]`; a single block is all body. */
export function splitComment(comment: string | null): [string, string] {
  if (!comment) return ['', ''];
  const cut = comment.indexOf('\n\n');
  return cut === -1 ? ['', comment] : [comment.slice(0, cut), comment.slice(cut + 2)];
}

const joinComment = (headline: string, body: string) =>
  [headline.trim(), body.trim()].filter(Boolean).join('\n\n');

export interface ReviewsLoad {
  criteria: Criterion[];
  pending: PendingSession[];
  mine: MyReview[];
  unauthorised?: boolean;
  error?: string;
}

export async function loadReviews(): Promise<ReviewsLoad> {
  const token = tokenStore.access;
  const empty = { criteria: [], pending: [], mine: [] };
  if (!token) return { ...empty, unauthorised: true };

  const [criteria, pending, mine] = await Promise.all([
    apiGetResult<Criterion[]>('/app/customer/reviews/criteria', { token }),
    apiGetResult<ApiPending[]>('/app/customer/reviews/pending', { token }),
    apiGetResult<ApiMine[]>('/app/customer/reviews/mine', { token }),
  ]);

  // Any 401 means the same thing for all three; the first one decides.
  const refused = [criteria, pending, mine].find((r) => !r.ok && r.error.status === 401);
  if (refused) return { ...empty, unauthorised: true };

  if (!mine.ok) return { ...empty, error: mine.error.message };

  return {
    criteria: criteria.ok ? criteria.data : [],
    pending: pending.ok
      ? pending.data.map((row) => ({
          id: row.id,
          // A date column, serialised as an instant — day part only.
          sessionDate: row.sessionDate.slice(0, 10),
          service: row.service?.name ?? 'Session',
          trainer: row.instructor?.name ?? 'Your trainer',
          trainerId: row.instructor?.id ?? '',
          bookingCode: row.booking?.code ?? '',
        }))
      : [],
    mine: mine.data.map((row) => {
      const [headline, body] = splitComment(row.comment);
      return {
        id: row.id,
        rating: row.overallRating,
        headline,
        body,
        trainer: row.session?.instructor?.name ?? 'Your trainer',
        service: row.session?.service?.name ?? 'Session',
        date: (row.session?.sessionDate ?? '').slice(0, 10),
        state: row.state,
        published: row.publishedAt !== null,
        reply: row.reply,
      };
    }),
  };
}

export interface SubmitResult {
  ok: boolean;
  /** The server's own wording — it differs when a review is held for checks. */
  message?: string;
}

export async function submitReview(input: {
  sessionId: string;
  overallRating: number;
  headline: string;
  body: string;
  criteria: Record<string, number>;
}): Promise<SubmitResult> {
  const token = tokenStore.access;
  if (!token) return { ok: false, message: 'Please sign in again' };

  const result = await apiSend<{ flagged?: boolean }>(
    '/app/customer/reviews',
    'POST',
    {
      sessionId: input.sessionId,
      overallRating: input.overallRating,
      comment: joinComment(input.headline, input.body),
      // Only the scores actually given. A missing mandatory one is refused by
      // the server with the slug in `details.missing`, which is the message
      // the form shows — the client never invents a score.
      criteria: Object.entries(input.criteria).map(([slug, score]) => ({ slug, score })),
    },
    token,
  );

  return result.ok
    ? { ok: true, message: 'Thanks for your review.' }
    : { ok: false, message: result.error.message };
}

/** Star distribution over the customer's own reviews, for the scorecard. */
export function ratingSummary(mine: MyReview[]) {
  const counts = [0, 0, 0, 0, 0];
  for (const review of mine) counts[review.rating - 1] += 1;

  const total = mine.length;
  const average = total === 0 ? 0 : mine.reduce((sum, r) => sum + r.rating, 0) / total;

  return {
    total,
    average,
    // Highest star first, as the design's bars read top to bottom.
    bars: [5, 4, 3, 2, 1].map((star) => ({
      star,
      percent: total === 0 ? 0 : Math.round((counts[star - 1] / total) * 100),
    })),
  };
}
