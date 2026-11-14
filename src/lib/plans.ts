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

/** Cached five minutes: plans change when an administrator edits them. */
export async function listPlans(): Promise<Plan[]> {
  return (await apiGet<Plan[]>('/plans')) ?? [];
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
