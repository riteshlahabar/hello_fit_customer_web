'use client';

// The times a session may start on one day — PDF §5.7 step "select an
// available time slot".
//
// **What changed on 21 Nov 2026.** The design drew a grid of fixed slots and
// the API answers with one, but the client asked for the plainer thing: the
// customer picks a **start** and the end follows from the service's own
// length. "If customer select 8.00am then end session automatic go on
// 9.00am." So this module hands the page start minutes, and the end is
// arithmetic — `start + durationMin` — never a second choice that could
// disagree with the service.
//
// **Availability is still the backend's answer, never this file's.**
// `GET /slots` takes a service, a calendar day and an address and returns what
// the scheduling engine will honour: the institute window, the lead time, the
// granularity, approved leave, the daily cap and every existing session
// widened by the travel buffer. The page offers what comes back and nothing
// more — US-W08 requires exactly that. An empty answer is a fact, not an
// error.

import { apiGetResult } from './api';
import { tokenStore } from './auth';

export interface Slot {
  fromMinute: number;
  toMinute: number;
  fromTime: string;
  toTime: string;
  availableInstructors: number;
}

export interface SlotsResult {
  slots: Slot[];
  /** The API's own message — "no times available on this day". */
  message?: string;
  error?: string;
}

const auth = () => tokenStore.access;

export async function getSlots(
  serviceId: string,
  date: string,
  addressId: string,
  /** Narrows the grid to the one trainer the customer chose, PDF §3.6. */
  instructorId?: string,
): Promise<SlotsResult> {
  const token = auth();
  if (!token) return { slots: [], error: 'Please sign in to see available times' };

  const query = new URLSearchParams({ serviceId, date, addressId });
  if (instructorId) query.set('instructorId', instructorId);

  const result = await apiGetResult<Slot[]>(`/app/customer/slots?${query}`, { token });

  if (!result.ok) return { slots: [], error: result.error.message };

  const meta = result.meta as { count?: number } | undefined;

  return {
    slots: result.data,
    message:
      (meta?.count ?? result.data.length) === 0
        ? 'No times available on this day'
        : undefined,
  };
}

/**
 * The session a chosen start implies.
 *
 * Taken from the slot the API returned rather than recomputed, so a service
 * whose duration changed between the grid and the click cannot leave the page
 * showing one length and the booking carrying another.
 */
export function sessionOf(slot: Slot): { fromMinute: number; toMinute: number; minutes: number } {
  return {
    fromMinute: slot.fromMinute,
    toMinute: slot.toMinute,
    minutes: slot.toMinute - slot.fromMinute,
  };
}
