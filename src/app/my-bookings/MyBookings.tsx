'use client';

// The live half of My Bookings: the four stat cards and the list.
//
// The demo's stats were fixed strings (2, 8, ₹5,250, 1) with the caption
// "Across your sample bookings". They are counted from the real bookings
// now; the markup, classes and ids are the demo's.
//
// A signed-out visitor is sent to /login rather than shown an empty page —
// every route here needs a token.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookingList } from '@/components/BookingList';
import { money } from '@/data/bookings';
import { getMyBookings } from '@/lib/bookings';
import type { Booking } from '@/data/bookings';

export function MyBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await getMyBookings();
      if (cancelled) return;

      if (result.unauthorised) {
        router.replace('/login');
        return;
      }

      setError(result.error ?? null);
      setBookings(result.bookings);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const rows = bookings ?? [];

  const stats = {
    upcoming: rows.filter((b) => b.status === 'upcoming').length,
    completed: rows.filter((b) => b.status === 'completed').length,
    cancelled: rows.filter((b) => b.status === 'cancelled').length,
    // Cancelled bookings are refunded, so they are not money spent.
    spent: rows
      .filter((b) => b.status !== 'cancelled')
      .reduce((total, b) => total + b.price, 0),
  };

  return (
    <>
      <section className="stats">
        <div className="stat">
          <div className="stat-top">
            <span>Upcoming sessions</span>
            <span className="stat-icon">▣</span>
          </div>
          <strong id="statUpcoming">{stats.upcoming}</strong>
          <small>Ready for your next workout</small>
        </div>
        <div className="stat">
          <div className="stat-top">
            <span>Completed sessions</span>
            <span className="stat-icon">✓</span>
          </div>
          <strong id="statCompleted">{stats.completed}</strong>
          <small>You&apos;re building consistency</small>
        </div>
        <div className="stat">
          <div className="stat-top">
            <span>Total spent</span>
            <span className="stat-icon">₹</span>
          </div>
          <strong id="statSpent">{money(stats.spent)}</strong>
          <small>Across your bookings</small>
        </div>
        <div className="stat">
          <div className="stat-top">
            <span>Cancelled</span>
            <span className="stat-icon">↗</span>
          </div>
          <strong id="statCancelled">{stats.cancelled}</strong>
          <small>Booking history overview</small>
        </div>
      </section>

      {bookings === null ? (
        <div className="booking-list">Loading your bookings…</div>
      ) : error ? (
        <div className="booking-list">{error}</div>
      ) : (
        <BookingList bookings={bookings} />
      )}
    </>
  );
}
