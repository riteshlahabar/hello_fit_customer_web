'use client';

// The booking workflow — PDF §5.7. Service, date and time, address, quote,
// and the booking itself.
//
// **Availability is the backend's answer, never this file's.** `GET /slots`
// takes a service, a calendar day and an address and returns the slots the
// scheduling engine will actually honour; the grid renders what comes back
// and nothing more. US-W08 requires exactly that ("availability is checked by
// the backend").
//
// **Two things the website cannot supply today**, both flagged for the client:
//
// 1. **A provider.** `CreateBookingDto.instructorId` exists ("set to request a
//    specific teacher"), but there is no public provider search or profile
//    endpoint to choose one from, so the website books auto-assign. This is
//    the same gap that blocks Find a Trainer — PDF §5.5 and §5.6.
// 2. **A service area on a new address.** `GET /slots` returns an empty grid
//    when the address has no `areaId`, and `POST /addresses` takes `areaId`
//    from the client. There is no public endpoint listing areas and no
//    pincode-to-area resolution on the server, although the `pincodes` table
//    holds exactly that mapping. So a website-created address shows no slots
//    until an administrator sets its area.

import { apiGetResult, apiSend } from './api';
import { tokenStore } from './auth';
import type { ApiAddress } from './profile';

export interface Slot {
  fromMinute: number;
  toMinute: number;
  fromTime: string;
  toTime: string;
  availableInstructors: number;
}

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

export async function getAddresses(): Promise<ApiAddress[] | null> {
  const token = auth();
  if (!token) return null;

  const result = await apiGetResult<ApiAddress[]>('/app/customer/addresses', { token });
  return result.ok ? result.data : null;
}

export interface SlotsResult {
  slots: Slot[];
  /** The API's own message — "No slots available for this date". */
  message?: string;
  error?: string;
}

export async function getSlots(serviceId: string, date: string, addressId: string): Promise<SlotsResult> {
  const token = auth();
  if (!token) return { slots: [], error: 'Please sign in to see available times' };

  const query = new URLSearchParams({ serviceId, date, addressId });
  const result = await apiGetResult<Slot[]>(`/app/customer/slots?${query}`, { token });

  if (!result.ok) return { slots: [], error: result.error.message };

  const meta = result.meta as { count?: number } | undefined;

  return {
    slots: result.data,
    message: (meta?.count ?? result.data.length) === 0 ? 'No times available on this day' : undefined,
  };
}

export interface QuoteInput {
  serviceId: string;
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
      ...(input.sessionCount ? { sessionCount: input.sessionCount } : {}),
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
  /**
   * Customer-supplied booking preferences — the goal, level and trainer note
   * the design collects. `Booking.preferences` is the Json column meant for
   * them, so they are kept rather than dropped. Nothing surfaces them to the
   * teacher yet; flagged for the client.
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
      addressId: input.addressId,
      sessionDate: input.sessionDate,
      fromMinute: input.fromMinute,
      ...(input.toMinute !== undefined ? { toMinute: input.toMinute } : {}),
      ...(input.sessionCount ? { sessionCount: input.sessionCount } : {}),
      ...(input.addonIds?.length ? { addonIds: input.addonIds } : {}),
      ...(input.couponCode ? { couponCode: input.couponCode } : {}),
      ...(input.preferences ? { preferences: input.preferences } : {}),
      // Files the booking under the right channel for the admin screens and
      // 6.12 reports; the API defaults to APP_CUSTOMER without it.
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
export async function getBookingDetail(id: string): Promise<{ booking?: BookingDetail; error?: string; unauthorised?: boolean }> {
  const token = auth();
  if (!token) return { unauthorised: true };

  const result = await apiGetResult<BookingDetail>(`/app/customer/bookings/${id}`, { token });

  return result.ok
    ? { booking: result.data }
    : { error: result.error.message, unauthorised: result.error.status === 401 };
}

/** `480` → `08:00 AM`. Minutes from midnight, as the slot engine stores them. */
export function clockOf(minute: number): string {
  const hour24 = Math.floor(minute / 60);
  const minutes = String(minute % 60).padStart(2, '0');
  const suffix = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${minutes} ${suffix}`;
}

/** The next `count` calendar days as YYYY-MM-DD, starting today. */
export function nextDays(count: number): string[] {
  const days: string[] = [];
  const cursor = new Date();

  for (let index = 0; index < count; index += 1) {
    const month = String(cursor.getMonth() + 1).padStart(2, '0');
    days.push(`${cursor.getFullYear()}-${month}-${String(cursor.getDate()).padStart(2, '0')}`);
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}
