'use client';

// The booking-driven parts of the customer dashboard.
//
// **Only these parts.** The rest of the page — "Trainers you may like",
// "Your monthly goal", "Saved Trainers", "Fitness Goals" — stays as converted
// demo content: provider search has no endpoint (the marketplace question)
// and goals, saved trainers and monthly targets appear nowhere in the v3 PDF.
// Wiring them would mean inventing backend scope.
//
// Markup, classes and ids are the demo's throughout.
//
// **The clock (23-11-2026).** The countdown used to be computed once per page
// load, and "next session" meant the earliest `upcoming` booking by date —
// so today's session stayed on the dashboard, frozen at zero, long after it
// had finished, and only a reload moved it on. Now `useNow` ticks every
// second, a session counts as past once its **end** time has gone, and the
// card rolls on to the one after it by itself.

import { useEffect, useState } from 'react';
import { money, type Booking } from '@/data/bookings';
import { getMyBookings } from '@/lib/bookings';
import { byStart, sessionWindow } from '@/lib/clock';
import { NextSessionCard } from './NextSessionCard';
import { useNow } from './useNow';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/**
 * The sessions still ahead of the customer, soonest first.
 *
 * Two things the old `status === 'upcoming'` filter got wrong:
 *
 * * **The end, not the start.** A session in progress is still the next
 *   session; one whose end time has passed is not, whatever the API still
 *   says — the status only turns `COMPLETED` when the trainer or the cron
 *   marks it, which can be hours later.
 * * **The time, not just the day.** Two sessions on one day were previously
 *   left in whatever order the API returned them.
 */
const stillAhead = (rows: Booking[], now: number) =>
  rows
    .filter((b) => b.status === 'upcoming' && sessionWindow(b).end > now)
    .sort(byStart);

export function LiveSections() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const now = useNow();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await getMyBookings();
      if (!cancelled) setBookings(result.bookings);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (bookings === null) return <div className="upcoming">Loading your sessions…</div>;

  const ahead = stillAhead(bookings, now);
  const next = ahead[0];

  if (!next) {
    return (
      <div className="upcoming">
        <div className="session-card">
          <div className="session-top">
            <span className="pill">
              <span className="dot"></span> NO UPCOMING SESSION
            </span>
          </div>
          <div>
            <h3>Nothing booked yet</h3>
            <p>Book a session and it will appear here with a countdown.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="upcoming">
        <NextSessionCard booking={next} now={now} />
      </div>

      <div className="booking-list" id="upcomingList">
        {ahead.slice(0, 4).map((b) => {
          const [, month, day] = b.date.split('-');
          return (
            <div className="booking-row" key={b.id}>
              <div className="datebox">
                <small>{MONTHS[Number(month) - 1]}</small>
                <strong>{day}</strong>
              </div>
              <div className="booking-info">
                <strong>{b.service}</strong>
                <small>
                  {b.trainer} · {b.time} · {b.location}
                </small>
              </div>
              <span className="status confirmed">{b.payment}</span>
              <div className="booking-price">{money(b.price)}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
