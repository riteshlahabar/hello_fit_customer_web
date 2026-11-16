// Membership plans — the website's Plans page.
//
// Client instruction, 13 Nov 2026; not in the v3 PDF. Administered in the
// panel under Marketing → Plans, so the three cards the demo hard-coded are
// now whatever the client publishes.
//
// **No static fallback**, for the same reason as `providers.ts`: a price is a
// commitment, and showing a cached ₹499 after the client has changed it is
// worse than showing nothing. An unreachable API renders the empty state.

import { apiGet, apiGetResult } from './api';
import { tokenStore } from './auth';

export interface PlanFeature {
  label: string;
  /** ✓ when true, – when false — the design's struck-through row. */
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  eyebrow: string | null;
  description: string | null;
  /** Rupees per month. Zero is real — the free tier. */
  priceMonthly: number;
  /** Rupees per month when billed yearly, which is how the card reads it. */
  priceYearly: number;
  billingCaption: string | null;
  isPopular: boolean;
  features: PlanFeature[];
}

/**
 * Read live on every request — **not** cached.
 *
 * This used to take the 300-second default, which made `/plans` a build-time
 * snapshot refreshed every five minutes. On a live server that reads as broken:
 * an administrator changes a price, reloads the page and sees the old one, and
 * because Next serves stale-while-revalidate the *first* visit after the window
 * still shows the old page and only triggers the rebuild — the new price
 * appears on the visit after that. Measured on the VPS, 16 Nov 2026:
 * `x-nextjs-cache: HIT`, `s-maxage=300, stale-while-revalidate=31535700`.
 *
 * A price is a commitment, so it is the one thing on this site that must never
 * be served stale. `revalidate: 0` makes the fetch `cache: 'no-store'` and the
 * route dynamic. The cost is one API call per visit for three rows, on a page
 * nobody hammers.
 *
 * The 300-second default still applies to the catalog and the provider filters
 * (`catalog.ts`, `provider-filters.ts`) — deliberately. Those are large, change
 * rarely and are not promises to a customer.
 */
export async function listPlans(): Promise<Plan[]> {
  return (await apiGet<Plan[]>('/plans', { revalidate: 0 })) ?? [];
}

/**
 * The plan this customer chose, or `null` when they have not chosen one.
 *
 * `null` is the normal state, not an error: a plan is optional and a customer
 * can book without one. Returns `undefined` when there is no token at all, so
 * a caller can tell "signed out" from "signed in with no plan".
 */
export async function myPlan(): Promise<Plan | null | undefined> {
  const token = tokenStore.access;
  if (!token) return undefined;

  const result = await apiGetResult<Plan | null>('/plans/mine', { token });

  return result.ok ? result.data : null;
}
