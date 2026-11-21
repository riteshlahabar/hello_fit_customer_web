// Public provider search — PDF §5.5 (find and filter) and §5.6 (the profile).
//
// This is the marketplace half of the model: the customer filters and chooses,
// rather than the API assigning someone. `GET /providers` and
// `GET /providers/:id` are public and unauthenticated; only providers an
// administrator has approved (`InstructorService.approvedAt`, PDF 6.5) are
// ever returned, so nothing here needs to re-check visibility.
//
// Unlike `catalog.ts` there is **no static fallback**. A fallback here would
// show the demo's six invented trainers as though they were real people
// bookable on the site, which is worse than an honest "we could not load
// these" — so a failed search renders the empty state with an error message.

import { apiGetResult } from './api';

/** One card in the results list — the shape `GET /providers` returns. */
export interface ProviderCard {
  id: string;
  name: string;
  photoUrl: string | null;
  headline: string | null;
  experienceYears: number | null;
  languages: string[];
  specialisations: string[];
  rating: number;
  ratingCount: number;
  /** Cheapest of this provider's approved offerings; null if none priced. */
  fromPrice: number | null;
  categories: { id: string; name: string; slug: string }[];
  serviceCount: number;
}

export interface SearchMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  empty: boolean;
  /** The API sorts `price` within the page only, and says so. */
  priceSortIsPageOnly: boolean;
}

export type ProviderSort = 'recommended' | 'rating' | 'price';

export interface ProviderFilters {
  q?: string;
  categoryId?: string[];
  /**
   * One service — the booking flow filter, narrower than a category.
   * The customer picks a package on `/packages`, which is sold against a
   * service, so by the time they reach this list the service is decided and
   * only providers an administrator approved for it may be shown (client,
   * 21 Nov 2026). A category would be wrong: it holds several services, and a
   * provider approved for Hatha Yoga must not surface for Power Yoga.
   */
  serviceId?: string;
  cityId?: string;
  areaId?: string;
  maxPrice?: number;
  minRating?: number;
  sort?: ProviderSort;
  page?: number;
}

/**
 * Only filters the customer actually set are sent. An empty array or a blank
 * string must not become `?categoryId=`, which the API rejects as a bad UUID
 * and the page would then render as "no trainers" — a filter the visitor never
 * chose, silently emptying the list.
 */
export function toQueryString(filters: ProviderFilters): string {
  const params = new URLSearchParams();

  if (filters.q?.trim()) params.set('q', filters.q.trim());
  // The service wins over the category server-side when both are sent, so
  // there is no point sending both.
  if (filters.serviceId) params.set('serviceId', filters.serviceId);
  else if (filters.categoryId?.length) params.set('categoryId', filters.categoryId.join(','));
  if (filters.cityId) params.set('cityId', filters.cityId);
  if (filters.areaId) params.set('areaId', filters.areaId);
  if (typeof filters.maxPrice === 'number') params.set('maxPrice', String(filters.maxPrice));
  if (typeof filters.minRating === 'number' && filters.minRating > 0) {
    params.set('minRating', String(filters.minRating));
  }
  if (filters.sort && filters.sort !== 'recommended') params.set('sort', filters.sort);
  if (filters.page && filters.page > 1) params.set('page', String(filters.page));

  const query = params.toString();
  return query ? `?${query}` : '';
}

export interface SearchOutcome {
  rows: ProviderCard[];
  meta: SearchMeta | null;
  /** Set when the request itself failed, as opposed to matching nobody. */
  error: string | null;
}

const EMPTY_META: SearchMeta = {
  page: 1,
  limit: 12,
  total: 0,
  pages: 1,
  empty: true,
  priceSortIsPageOnly: false,
};

export async function searchProviders(
  filters: ProviderFilters,
): Promise<SearchOutcome> {
  const result = await apiGetResult<ProviderCard[]>(
    `/providers${toQueryString(filters)}`,
    { revalidate: 0 },
  );

  if (!result.ok) {
    return { rows: [], meta: EMPTY_META, error: result.error.message };
  }

  return {
    rows: result.data ?? [],
    meta: (result.meta as SearchMeta) ?? EMPTY_META,
    error: null,
  };
}


/**
 * The homepage's trainer band — the highest-rated providers, live.
 *
 * Until 13 Nov this section rendered three invented people from
 * `src/data/home.ts` ("Alex Morgan", 4.9, ₹900) whose "View profile" button
 * only raised a toast. There is no fallback here for the same reason
 * `searchProviders` has none: showing invented trainers as though they were
 * bookable is worse than showing none, so a failed call renders no band.
 */
export async function topProviders(limit = 3): Promise<ProviderCard[]> {
  const result = await apiGetResult<ProviderCard[]>(
    `/providers?sort=rating&limit=${limit}`,
    { revalidate: 300 },
  );

  return result.ok ? (result.data ?? []) : [];
}
