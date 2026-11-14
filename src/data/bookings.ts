/**
 * Sample bookings, lifted from the demo's `bookings` array in hellofit-my-bookings.html.
 *
 * Prototype content. This is the shape `GET /app/customer/bookings` should return, so the
 * page below it changes very little when the API is wired — swap the import for a fetch.
 */

export type BookingStatus = 'upcoming' | 'completed' | 'cancelled';

export type Booking = {
  /** The human reference (HF-…), which is what the design shows. */
  id: string;
  /**
   * The API's uuid, which is what `/app/customer/bookings/:id` takes. Absent
   * on the static fallback rows below, so every use must cope without it.
   */
  bookingId?: string;
  /**
   * The ids behind the two names below, carried so "Book again" can reopen
   * the booking page with the same service and the same trainer preselected
   * (Phase 5, 13 Nov 2026). Absent on the static fallback rows, and
   * `instructorId` is also absent on a booking still awaiting assignment —
   * both cases fall back to an unfiltered `/booking`.
   */
  serviceId?: string;
  instructorId?: string;
  trainer: string;
  initials: string;
  service: string;
  /** ISO calendar date — a day, not an instant. See the backend's calendar.ts note. */
  date: string;
  time: string;
  duration: string;
  location: string;
  price: number;
  status: BookingStatus;
  payment: string;
  emoji: string;
};

export const bookings: Booking[] = [
  { id: 'HF-261028-1042', trainer: 'Sneha Patil', initials: 'SP', service: 'Personal Yoga Session', date: '2026-11-02', time: '08:00 AM', duration: '60 min', location: 'At your home', price: 600, status: 'upcoming', payment: 'Paid', emoji: '🧘🏻‍♀️' },
  { id: 'HF-261028-1038', trainer: 'Rohan Mehta', initials: 'RM', service: 'Strength Training', date: '2026-11-05', time: '06:30 PM', duration: '45 min', location: "Trainer's location", price: 850, status: 'upcoming', payment: 'Paid', emoji: '🏋️' },
  { id: 'HF-261020-0921', trainer: 'Sneha Patil', initials: 'SP', service: 'Yoga & Flexibility', date: '2026-10-20', time: '07:00 AM', duration: '45 min', location: 'At your home', price: 500, status: 'completed', payment: 'Paid', emoji: '🧘🏻‍♀️' },
  { id: 'HF-261017-0885', trainer: 'Aarav Kulkarni', initials: 'AK', service: 'Online Yoga Session', date: '2026-10-17', time: '09:00 AM', duration: '45 min', location: 'Online session', price: 450, status: 'completed', payment: 'Paid', emoji: '💻' },
  { id: 'HF-261014-0810', trainer: 'Sneha Patil', initials: 'SP', service: 'Personal Yoga Session', date: '2026-10-14', time: '08:00 AM', duration: '60 min', location: 'At your home', price: 600, status: 'completed', payment: 'Paid', emoji: '🧘🏻‍♀️' },
  { id: 'HF-261011-0771', trainer: 'Rohan Mehta', initials: 'RM', service: 'Strength Training', date: '2026-10-11', time: '06:30 PM', duration: '45 min', location: "Trainer's location", price: 850, status: 'completed', payment: 'Paid', emoji: '🏋️' },
  { id: 'HF-261008-0704', trainer: 'Aarav Kulkarni', initials: 'AK', service: 'Online Yoga Session', date: '2026-10-08', time: '09:00 AM', duration: '45 min', location: 'Online session', price: 450, status: 'completed', payment: 'Paid', emoji: '💻' },
  { id: 'HF-261005-0662', trainer: 'Sneha Patil', initials: 'SP', service: 'Yoga & Flexibility', date: '2026-10-05', time: '07:00 AM', duration: '45 min', location: 'At your home', price: 500, status: 'completed', payment: 'Paid', emoji: '🧘🏻‍♀️' },
  { id: 'HF-260930-0594', trainer: 'Rohan Mehta', initials: 'RM', service: 'Strength Training', date: '2026-09-30', time: '06:30 PM', duration: '45 min', location: "Trainer's location", price: 850, status: 'completed', payment: 'Paid', emoji: '🏋️' },
  { id: 'HF-260927-0528', trainer: 'Aarav Kulkarni', initials: 'AK', service: 'Online Yoga Session', date: '2026-09-27', time: '09:00 AM', duration: '45 min', location: 'Online session', price: 450, status: 'completed', payment: 'Paid', emoji: '💻' },
  { id: 'HF-260922-0461', trainer: 'Sneha Patil', initials: 'SP', service: 'Personal Yoga Session', date: '2026-09-22', time: '08:00 AM', duration: '60 min', location: 'At your home', price: 600, status: 'cancelled', payment: 'Refunded', emoji: '🧘🏻‍♀️' },
];

export const statusLabel: Record<BookingStatus, string> = {
  upcoming: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

/** "2026-11-02" -> "2 Nov 2026". Split on the string, never `new Date('2026-11-02')`:
 *  that parses as UTC midnight and shifts a day backwards in any UTC+ timezone. */
export function formatBookingDate(iso: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${months[m - 1]} ${y}`;
}

export const money = (n: number) => `₹${n.toLocaleString('en-IN')}`;
