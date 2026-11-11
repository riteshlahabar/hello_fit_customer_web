// Live bookings, mapped into the `Booking` shape `src/data/bookings.ts`
// already defines — so `BookingList` and the session-details page render
// unchanged. `bookings.ts` itself said this was the plan: "swap the import
// for a fetch".
//
// The API is session-shaped and the design is booking-shaped, so two things
// are derived here rather than read:
//
// - **status** — the design has three (`upcoming`/`completed`/`cancelled`)
//   and the API has thirteen session statuses. The rollup is below.
// - **emoji** — pure decoration with no column behind it, chosen from the
//   service name. A booking with no match gets the generic one rather than
//   a blank, because the card reserves space for it.

import { apiGetResult } from './api';
import { tokenStore } from './auth';
import type { Booking, BookingStatus } from '@/data/bookings';

interface ApiSession {
  id: string;
  sequence: number;
  sessionDate: string;
  fromMinute: number;
  toMinute: number;
  status: string;
  instructor?: { id: string; name: string } | null;
}

interface ApiBooking {
  id: string;
  code: string;
  type: string;
  payable: string;
  paymentStatus: string;
  createdAt: string;
  service?: { id: string; name: string; durationMin: number } | null;
  address?: { label: string; city?: { name: string } | null } | null;
  sessions: ApiSession[];
}

/** Session statuses that mean the booking is over, one way or another. */
const DONE = new Set(['COMPLETED']);
const DEAD = new Set([
  'CANCELLED_BY_CUSTOMER',
  'CANCELLED_BY_TEACHER',
  'CANCELLED_BY_ADMIN',
  'NO_SHOW_CUSTOMER',
  'NO_SHOW_TEACHER',
]);

function rollUpStatus(sessions: ApiSession[]): BookingStatus {
  if (sessions.length === 0) return 'cancelled';

  // A package is "upcoming" while any occurrence still has life in it —
  // one completed session does not finish the booking.
  if (sessions.some((s) => !DONE.has(s.status) && !DEAD.has(s.status))) return 'upcoming';
  if (sessions.some((s) => DONE.has(s.status))) return 'completed';
  return 'cancelled';
}

/** `480` → `08:00 AM`. Minutes from midnight, as the slot engine stores them. */
function clock(minute: number): string {
  const hour24 = Math.floor(minute / 60);
  const minutes = String(minute % 60).padStart(2, '0');
  const suffix = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${String(hour12).padStart(2, '0')}:${minutes} ${suffix}`;
}

/** `Sneha Patil` → `SP`. The card shows initials when there is no photo. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || '—';
}

const EMOJI: [RegExp, string][] = [
  [/yoga|pranayama|meditat/i, '🧘🏻‍♀️'],
  [/strength|power|gym|training/i, '🏋️'],
  [/online|virtual/i, '💻'],
  [/zumba|dance|cardio/i, '💃'],
  [/pilates|mobility|stretch/i, '🤸'],
];

const emojiFor = (service: string) =>
  EMOJI.find(([pattern]) => pattern.test(service))?.[1] ?? '🏃';

function toBooking(row: ApiBooking): Booking {
  const first = row.sessions[0];
  const trainer = first?.instructor?.name ?? 'Awaiting assignment';
  const service = row.service?.name ?? 'Session';

  // `sessionDate` is a date column; the API serialises it as an ISO instant,
  // so only the day part is taken. Never `new Date(...)` on it — that is the
  // off-by-one in the backend's calendar.ts note.
  const date = (first?.sessionDate ?? row.createdAt).slice(0, 10);

  const minutes =
    first && first.toMinute > first.fromMinute
      ? first.toMinute - first.fromMinute
      : (row.service?.durationMin ?? 60);

  return {
    id: row.code,
    bookingId: row.id,
    trainer,
    initials: first?.instructor ? initialsOf(trainer) : '–',
    service,
    date,
    time: first ? clock(first.fromMinute) : '—',
    duration: `${minutes} min`,
    location: row.address?.label ?? 'At your home',
    price: Number(row.payable),
    status: rollUpStatus(row.sessions),
    payment: row.paymentStatus === 'PAID' ? 'Paid' : row.paymentStatus === 'REFUNDED' ? 'Refunded' : 'Unpaid',
    emoji: emojiFor(service),
  };
}

export interface BookingsResult {
  bookings: Booking[];
  /** Set when the customer must sign in again, so the page can redirect. */
  unauthorised?: boolean;
  error?: string;
}

/** The customer's bookings. Needs a token — call from a client component. */
export async function getMyBookings(): Promise<BookingsResult> {
  const token = tokenStore.access;
  if (!token) return { bookings: [], unauthorised: true };

  const result = await apiGetResult<ApiBooking[]>('/app/customer/bookings', { token });

  if (!result.ok) {
    return {
      bookings: [],
      unauthorised: result.error.status === 401,
      error: result.error.message,
    };
  }

  return { bookings: result.data.map(toBooking) };
}
