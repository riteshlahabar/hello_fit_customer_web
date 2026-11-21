'use client';

// The price and the booking itself — PDF §5.7 and §5.8.
//
// Split on 21 Nov 2026, when this file went past the 200-line rule: the
// addresses moved to `addresses.ts`, the slot grid to `slots.ts`, the clock
// and calendar helpers to `clock.ts`. What is left is the two writes that
// cost money.
//
// **`packageId` is the price.** A package holds a signed percent and a head
// count, the service holds the rate, and `PricingResolver` multiplies them:
// `basePrice x persons x sessionCount`, then `percentAdjust`. The API has
// taken `packageId` on both routes since 18 Nov — **the website never sent
// it**, so every quote came back at one session of `Service.basePrice` and
// the customer saw the base price after choosing a package (client,
// 21 Nov 2026). It is now carried from `/packages` through the whole flow.
//
// **The server computes every figure.** Nothing here adds anything up: the
// discount, the travel charge, the tax and the payable all come from
// `POST /bookings/quote`, and the coupon is re-validated inside
// `POST /bookings` rather than trusted from the quote the page showed.
//
// **A provider can be chosen (PDF §3.6).** `instructorId` reaches both the
// slot grid and the create, which re-checks that trainer is free for every
// occurrence and refuses with a 409 naming the date rather than quietly
// assigning somebody else. Omitted, the API auto-assigns as before.

import { apiGetResult, apiSend } from './api';
import { tokenStore } from './auth';

export interface Quote {
  unitPrice: number;
  sessionCount: number;
  grossAmount: number;
  addonAmount: number;
  travelCharge: number;
  discount: number;
  taxableValue: number;
  tax: number;
  walletApplied: number;
  payable: number;
  currency: string;
  coupon: { code: string; discount: number } | null;
}

export interface CreatedBooking {
  id: string;
  code: string;
  payable: string;
  paymentStatus: string;
  holdExpiresAt: string | null;
}

const auth = () => tokenStore.access;

export interface QuoteInput {
  serviceId: string;
  /**
   * The package the customer picked on `/packages`. It carries the session
   * count and the head count, so `sessionCount` below must not be sent with
   * it — the API refuses a head count that disagrees with the package.
   */
  packageId?: string;
  sessionCount?: number;
  addonIds?: string[];
  couponCode?: string;
  distanceKm?: number;
}

export interface QuoteResult {
  quote?: Quote;
  /** Set when a coupon was refused, so the field can say why. */
  error?: string;
}

export async function getQuote(input: QuoteInput): Promise<QuoteResult> {
  const token = auth();
  if (!token) return { error: 'Please sign in to see the price' };

  const result = await apiSend<Quote>(
    '/app/customer/bookings/quote',
    'POST',
    {
      serviceId: input.serviceId,
      ...(input.packageId ? { packageId: input.packageId } : {}),
      // Only without a package: the package defines its own count and the API
      // ignores this field when one is present.
      ...(!input.packageId && input.sessionCount ? { sessionCount: input.sessionCount } : {}),
      ...(input.addonIds?.length ? { addonIds: input.addonIds } : {}),
      ...(input.couponCode ? { couponCode: input.couponCode } : {}),
      ...(input.distanceKm !== undefined ? { distanceKm: input.distanceKm } : {}),
    },
    token,
  );

  return result.ok ? { quote: result.data } : { error: result.error.message };
}

export interface CreateInput extends QuoteInput {
  addressId: string;
  sessionDate: string;
  fromMinute: number;
  toMinute?: number;
  instructorId?: string;
  /**
   * The goal, level and trainer note the design collects.
   * `Booking.preferences` is the Json column meant for them; `GET /requests`
   * and `GET /bookings/:id` in the trainer app surface the goal and the notes.
   */
  preferences?: Record<string, unknown>;
}

export interface CreateResult {
  booking?: CreatedBooking;
  error?: string;
}

export async function createBooking(input: CreateInput): Promise<CreateResult> {
  const token = auth();
  if (!token) return { error: 'Please sign in again' };

  const result = await apiSend<CreatedBooking>(
    '/app/customer/bookings',
    'POST',
    {
      serviceId: input.serviceId,
      ...(input.packageId ? { packageId: input.packageId } : {}),
      addressId: input.addressId,
      sessionDate: input.sessionDate,
      fromMinute: input.fromMinute,
      ...(input.toMinute !== undefined ? { toMinute: input.toMinute } : {}),
      ...(input.instructorId ? { instructorId: input.instructorId } : {}),
      ...(!input.packageId && input.sessionCount ? { sessionCount: input.sessionCount } : {}),
      ...(input.addonIds?.length ? { addonIds: input.addonIds } : {}),
      ...(input.couponCode ? { couponCode: input.couponCode } : {}),
      ...(input.preferences ? { preferences: input.preferences } : {}),
      // Files the booking under the right channel for the admin screens and
      // §6.12 reports; the API defaults to APP_CUSTOMER without it.
      source: 'WEBSITE',
    },
    token,
  );

  return result.ok ? { booking: result.data } : { error: result.error.message };
}

export interface BookingDetail {
  id: string;
  code: string;
  paymentStatus: string;
  grossAmount: string;
  travelCharge: string;
  discount: string;
  tax: string;
  payable: string;
  preferences: Record<string, unknown> | null;
  service: { name: string; durationMin: number } | null;
  address: { label: string; line1: string; pincode: string } | null;
  sessions: {
    id: string;
    sequence: number;
    sessionDate: string;
    fromMinute: number;
    toMinute: number;
    status: string;
    instructor: { id: string; name: string; ratingAvg: string | null } | null;
  }[];
  addons: { addon: { name: string } }[];
}

/** One booking, for the confirmation page. 404s are the caller's to report. */
export async function getBookingDetail(
  id: string,
): Promise<{ booking?: BookingDetail; error?: string; unauthorised?: boolean }> {
  const token = auth();
  if (!token) return { unauthorised: true };

  const result = await apiGetResult<BookingDetail>(`/app/customer/bookings/${id}`, { token });

  return result.ok
    ? { booking: result.data }
    : { error: result.error.message, unauthorised: result.error.status === 401 };
}
