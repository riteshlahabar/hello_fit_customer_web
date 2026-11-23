// Clock and calendar arithmetic for the booking flow.
//
// Split out of `booking.ts` on 21 Nov 2026: `clockOf` is wanted by the
// confirmation page and the session-details page, neither of which has
// anything to do with slots or quotes, and the file was over the 200-line
// rule before the start-time work added to it.
//
// Everything here is **minutes from midnight**, the unit the scheduling
// engine stores (`BookingSession.fromMinute`). Integer arithmetic cannot
// shift a session by an hour the way a time-zone conversion can.

import type { Booking } from '@/data/bookings';

/** `480` → `08:00 AM`. */
export function clockOf(minute: number): string {
  const hour24 = Math.floor(minute / 60);
  const minutes = String(minute % 60).padStart(2, '0');
  const suffix = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${minutes} ${suffix}`;
}

/**
 * `08:00 AM` → `480`. The inverse of `clockOf`, for a row that carries only
 * the printed string — the static fallback bookings in `data/bookings.ts`
 * have no minute columns. Unreadable → midnight, never NaN.
 */
export function minuteOfClock(printed: string): number {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(printed.trim());
  if (!match) return 0;

  const hour = (Number(match[1]) % 12) + (match[3].toUpperCase() === 'PM' ? 12 : 0);
  return hour * 60 + Number(match[2]);
}

/** `60 min` → `60`. Same fallback as the API mapper's: an hour. */
export function minutesOfDuration(printed: string): number {
  const match = /(\d+)/.exec(printed);
  return match ? Number(match[1]) : 60;
}

/**
 * The local instant, in ms, at `minute` minutes past midnight on calendar
 * day `iso`.
 *
 * Built part by part, never `new Date(iso)`: an ISO date string parses as UTC
 * midnight and lands on the day before in any UTC+ zone — the trap
 * `data/bookings.ts` and the backend's `calendar.ts` both warn about.
 */
export function instantOf(iso: string, minute: number): number {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, Math.floor(minute / 60), minute % 60).getTime();
}

/**
 * When the session shown on a booking row starts and ends, as instants.
 *
 * Prefers the minute columns the API sends; falls back to parsing the
 * printed `08:00 AM` / `60 min` strings so the static rows still work. The
 * **end** is what tells a page that a session is over — a booking is not
 * "past" the moment it begins.
 */
export function sessionWindow(booking: Booking): { start: number; end: number } {
  const from = booking.fromMinute ?? minuteOfClock(booking.time);
  const to =
    booking.toMinute !== undefined && booking.toMinute > from
      ? booking.toMinute
      : from + minutesOfDuration(booking.duration);

  return { start: instantOf(booking.date, from), end: instantOf(booking.date, to) };
}

/** Chronological by the session each row shows — date first, then the clock. */
export const byStart = (a: Booking, b: Booking) =>
  sessionWindow(a).start - sessionWindow(b).start;

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

/** `2026-11-21` → `0`–`6`, Sunday first, the way `Package.allowedWeekdays` counts. */
export function weekdayOf(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

/**
 * `2026-11-21` → the parts the date strip draws, plus the long form the
 * summary prints.
 *
 * `dd-mm-yyyy` is the project rule for a date a person reads, so `long`
 * carries it alongside the weekday rather than the locale's own order.
 */
export function dateParts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const when = new Date(y, m - 1, d);
  const day = String(d).padStart(2, '0');
  const month = String(m).padStart(2, '0');

  return {
    weekday: when.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase(),
    day,
    monthName: when.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase(),
    /** "SAT, 21-11-2026" — rule 4, `state/date-format.md`. */
    long: `${when.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase()}, ${day}-${month}-${y}`,
  };
}
