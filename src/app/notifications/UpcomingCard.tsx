'use client';

// The aside's "Upcoming session" card, from the customer's own bookings
// rather than the demo's fixed "Strength Training with Sneha Patil".
//
// The design's "Reminder set for 1 hour before" row and its "Edit reminder"
// button are not rendered: there is no reminder setting in the API — the
// notification events are driven by booking state, not by a per-customer
// lead time — so the row would be a number with nothing behind it. The
// client's call whether reminders become a real setting.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyBookings } from '@/lib/bookings';
import { formatBookingDate } from '@/data/bookings';
import type { Booking } from '@/data/bookings';

export function UpcomingCard() {
  const [next, setNext] = useState<Booking | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await getMyBookings();
      if (cancelled) return;

      // The list is newest first; the soonest upcoming session is the one
      // with the earliest date among those still to run.
      const upcoming = result.bookings
        .filter((b) => b.status === 'upcoming')
        .sort((a, b) => a.date.localeCompare(b.date));

      setNext(upcoming[0] ?? null);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="card settings-card">
      <div className="card-head">
        <div>
          <h2>Upcoming session</h2>
          <div className="sub">Your next fitness commitment</div>
        </div>
      </div>
      <div className="session">
        {next === undefined && <p>Loading your next session…</p>}

        {next === null && (
          <>
            <h3>No session booked</h3>
            <p>When you book a session it will show up here.</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '13px' }}>
              <Link className="primary" href="/find-a-trainer" style={{ textDecoration: 'none' }}>
                Find a trainer
              </Link>
            </div>
          </>
        )}

        {next && (
          <>
            <div className="session-top">
              <span className="eyebrow" style={{ letterSpacing: '1px' }}>
                {formatBookingDate(next.date)} · {next.time}
              </span>
              <span className="pill">{next.payment === 'Paid' ? 'Confirmed' : next.payment}</span>
            </div>
            <h3>{next.service}</h3>
            <p>
              with {next.trainer}
              <br />
              {next.duration} · {next.location}
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '13px' }}>
              <Link
                className="secondary"
                id="viewBooking"
                href={next.bookingId ? `/session-details?booking=${next.bookingId}` : '/my-bookings'}
                style={{ textDecoration: 'none' }}
              >
                View booking
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
