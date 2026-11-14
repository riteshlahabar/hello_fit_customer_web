// One provider's public profile — PDF §5.6, the Trainer Profile page.
//
// Split out of `providers.ts` on 13 Nov 2026 (Phase 5): that file is the
// search — the card shape, the filters and the query string — and adding the
// profile and its reviews to it took it past the 200-line rule. The two are
// genuinely different shapes, not one with extra fields: the detail route
// returns `bio` where the card returns `headline`, and carries no
// `fromPrice`, `categories` or `serviceCount`.

import { apiGetResult } from './api';
import type { SessionFormat } from './providers';

/**
 * One provider's public profile — §5.6. A 404 is returned both for a provider
 * who does not exist and for one who is not public, so the route cannot be
 * used to discover who is suspended or unapproved.
 *
 * Deliberately NOT an extension of ProviderCard: the detail route returns
 * `bio` where the card returns `headline`, and carries no `fromPrice`,
 * `categories` or `serviceCount` — those are card-only summaries.
 */
export interface ProviderProfile {
  id: string;
  name: string;
  photoUrl: string | null;
  bio: string | null;
  experienceYears: number | null;
  languages: string[];
  specialisations: string[];
  sessionFormats: SessionFormat[];
  rating: number;
  ratingCount: number;
  services: {
    id: string;
    offeringId: string;
    name: string;
    slug: string;
    durationMin: number;
    level: string | null;
    /** The provider's own price when set, else the service's base — §4.5. */
    price: number;
    category: { id: string; name: string; slug: string } | null;
  }[];
  areas: { id: string; name: string; city: { id: string; name: string } | null }[];
}

export async function getProvider(id: string): Promise<ProviderProfile | null> {
  const result = await apiGetResult<ProviderProfile>(`/providers/${id}`, {
    revalidate: 0,
  });

  return result.ok ? result.data : null;
}

/**
 * One provider's public reviews — the profile's Reviews tab.
 *
 * A separate call rather than part of `GET /providers/:id`, which deliberately
 * does not embed them: the review list has its own public route and its own
 * paging, and two shapes for the same thing is how they drift apart.
 *
 * `distribution` is what the design's 5★/4★/3★ bars are drawn from. The demo
 * hard-coded 88% / 9% / 2% / 1%; these are counts per star from the real
 * `RatingAggregate`, so a provider with four reviews shows four.
 */
export interface ProviderReview {
  id: string;
  overallRating: number;
  comment: string | null;
  tags: string[];
  photos: string[];
  recommendAgain: boolean | null;
  publishedAt: string | null;
  reply: string | null;
  repliedAt: string | null;
  criteriaScores: { score: number; criteria: { name: string; slug: string } }[];
}

export interface ProviderReviewsPayload {
  aggregate: {
    ratingAvg: number | string;
    ratingCount: number;
    criteriaAverages: Record<string, number> | null;
    /** Star (`"5"`…`"1"`) → how many reviews gave it. */
    distribution: Record<string, number> | null;
  };
  reviews: ProviderReview[];
}

export async function getProviderReviews(
  id: string,
  limit = 10,
): Promise<ProviderReviewsPayload | null> {
  const result = await apiGetResult<ProviderReviewsPayload>(
    `/instructors/${id}/reviews?limit=${limit}`,
    { revalidate: 0 },
  );

  return result.ok ? result.data : null;
}
