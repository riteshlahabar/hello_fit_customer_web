'use client';

// The dashboard's "All sessions" panel — the demo's `renderAllBookings()`,
// now reading the live API instead of its sample array.
//
// The row markup is the demo's, class for class: `.booking-row` > `.datebox`
// (month + day) / `.booking-info` (title + trainer · time · place) /
// `.status` / `.booking-price`. Its filter dropdown (`#bookingFilter`) is kept
// working too, since it already exists in the converted page.
//
// The two row buttons the demo shipped — Details and Reschedule/Cancel — are
// deliberately NOT rendered. Reschedule and cancel are real money-affecting
// operations with refund slabs behind them, and wiring a button that silently
// does nothing is worse than not drawing it. They belong with the booking
// detail work, not here.

import { useEffect, useState } from 'react';
import { getMyBookings } from '@/lib/bookings';
import { money, statusLabel, type Booking } from '@/data/bookings';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/**
 * The filter, matched to the statuses that actually exist.
 *
 * The demo offered "All / Confirmed / Awaiting confirmation", but
 * `BookingStatus` is `upcoming | completed | cancelled` — **there is no
 * pending booking**. Payment state is a separate field, so "awaiting
 * confirmation" described nothing the API can return and its option is now
 * "Completed", which customers do ask for.
 */
type Filter = 'all' | 'upcoming' | 'completed';

/**
 * The design ships exactly two status colours — `.confirmed` (green) and
 * `.pending` (amber) — and no `.completed` or `.cancelled`. So rather than
 * write new CSS into the client's design, upcoming and completed both take the
 * green pill and a cancellation takes the amber one as the odd state out.
 */
function statusClass(status: Booking['status']): string {
  return status === 'cancelled' ? 'pending' : 'confirmed';
}

function dateParts(iso: string): { month: string; day: string } {
  // Calendar day, parsed as parts — `new Date(iso)` would shift the day in any
  // UTC+ timezone, the trap `src/data/bookings.ts` warns about.
  const [, m, d] = iso.split('-');
  const index = Number(m) - 1;
  return {
    month: MONTHS[index] ?? '—',
    day: d ?? '—',
  };
}

export function LiveBookingsPanel() {
  const [rows, setRows] = useState<Booking[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    let live = true;

    void getMyBookings().then((result) => {
      if (!live) return;
      if (result.unauthorised) {
        setNote('Sign in to see your sessions.');
        setRows([]);
        return;
      }
      if (result.error) {
        setNote(result.error);
        setRows([]);
        return;
      }
      setRows(result.bookings);
    });

    return () => {
      live = false;
    };
  }, []);

  const shown = (rows ?? []).filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  // The whole `.section` is rendered here, not just the list: the design puts
  // the filter inside `.section-head` and the list as its sibling, so a
  // component owning only the list would leave the `<select>` stranded in the
  // page with no state to drive it.
  return (
    <div className="section">
      <div className="section-head">
        <div>
          <h2>All sessions</h2>
          <p>Every session on your account.</p>
        </div>
        <select
          id="bookingFilter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
          style={{ border: '1px solid var(--line)', borderRadius: '9px', padding: '9px', background: '#fff', fontSize: '11px' }}
        >
          <option value="all">All bookings</option>
          <option value="upcoming">Confirmed</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="booking-list" id="allBookingList">
        {rows === null && <p className="muted">Loading your sessions…</p>}
        {note && <p className="muted">{note}</p>}
        {rows !== null && !note && shown.length === 0 && <p className="muted">No sessions to show.</p>}

        {shown.map((b) => {
          const { month, day } = dateParts(b.date);
          return (
            <div className="booking-row" key={b.id}>
              <div className="datebox"><small>{month}</small><strong>{day}</strong></div>
              <div className="booking-info">
                <strong>{b.service}</strong>
                <small>{b.trainer} · {b.time} · {b.location}</small>
              </div>
              <span className={`status ${statusClass(b.status)}`}>{statusLabel[b.status]}</span>
              <div className="booking-price">{money(b.price)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
