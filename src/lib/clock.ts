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

/** `480` → `08:00 AM`. */
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
