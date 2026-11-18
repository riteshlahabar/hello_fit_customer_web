// Packages — the website's Package page.
//
// Replaces `plans.ts`. Membership plans were deleted on 17 Nov 2026: the
// client reads "plan" as "package", there is no subscription behind any of
// this, and `modules/plan/` is gone from the backend. → state/pricing-rules.md
//
// A package is **global and holds a percent, not a price**: the same -15%
// applies to whatever the chosen service costs. So this page shows the terms
// — sessions, free sessions, validity, the adjustment — and the money appears
// on the service, once a trainer and a service are picked.
//
// **No static fallback**, for the same reason as `providers.ts`: terms are a
// commitment, and showing a cached package after the client has changed it is
// worse than showing nothing. An unreachable API renders the empty state.

import { apiGet } from './api';

export interface Package {
  id: string;
  name: string;
  /** The symbol the admin typed; null means the card draws its own mark. */
  icon: string | null;
  /** Sessions the customer pays for. */
  sessionCount: number;
  /** People attending each session; above 1 makes it a group package. */
  persons: number;
  /** Delivered on top, charged to nobody — the trial is 1 + 1. */
  freeSessionCount: number;
  validityDays: number;
  /** Signed: +20 is the trial markup, -15 the intensive discount. */
  percentAdjust: number;
  /** 0 = Sunday to 6 = Saturday. Empty means any weekday. */
  allowedWeekdays: number[];
  fixedInstructorAllowed: boolean;
  sortOrder: number;
  /** Null without a `serviceId` — the rate belongs to the service. */
  price: number | null;
  perSessionPrice: number | null;
}

/**
 * Read live on every request — **not** cached, for the reason `plans.ts`
 * carried before it: an administrator changes a package, reloads the page and
 * must see the change. Measured on the VPS, 16 Nov 2026, the 300-second
 * default served the previous version twice over
 * (`s-maxage=300, stale-while-revalidate`).
 *
 * The 300-second default still applies to the catalog and the provider
 * filters — those are large, change rarely, and promise nothing.
 */
export async function listPackages(serviceId?: string): Promise<Package[]> {
  const query = serviceId ? `?serviceId=${encodeURIComponent(serviceId)}` : '';

  return (await apiGet<Package[]>(`/packages${query}`, { revalidate: 0 })) ?? [];
}
