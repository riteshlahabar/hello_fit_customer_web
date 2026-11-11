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

import { useEffect, useState } from 'react';
import { formatBookingDate, money, type Booking } from '@/data/bookings';
import { getMyBookings } from '@/lib/bookings';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/** Soonest upcoming session first — the one the countdown is about. */
const nextOf = (rows: Booking[]) =>
  rows
    .filter((b) => b.status === 'upcoming')
    .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;

/**
 * Whole days/hours/minutes until a session starts.
 *
 * Built from the date and the "08:00 AM" string rather than `new Date(iso)`:
 * the date is a calendar day, and parsing it as an instant shifts it a day in
 * any UTC+ timezone — the trap `src/data/bookings.ts` already warns about.
 */
function countdownTo(booking: Booking) {
  const [y, m, d] = booking.date.split('-').map(Number);
  const match = /^(\d{2}):(\d{2})\s*(AM|PM)$/i.exec(booking.time);

  let hour = 0;
  let minute = 0;

  if (match) {
    hour = Number(match[1]) % 12;
    minute = Number(match[2]);
    if (match[3].toUpperCase() === 'PM') hour += 12;
  }

  const starts = new Date(y, m - 1, d, hour, minute).getTime();
  const left = Math.max(0, starts - Date.now());

  return {
    days: String(Math.floor(left / 86_400_000)).padStart(2, '0'),
    hours: String(Math.floor((left / 3_600_000) % 24)).padStart(2, '0'),
    mins: String(Math.floor((left / 60_000) % 60)).padStart(2, '0'),
  };
}

export function LiveSections() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);

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

  const next = nextOf(bookings);
  const upcoming = bookings.filter((b) => b.status === 'upcoming').slice(0, 4);

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

  const left = countdownTo(next);

  return (
    <>
      <div className="upcoming">
        <div className="session-card">
          <div className="session-top">
            <span className="pill">
              <span className="dot"></span> UPCOMING SESSION
            </span>
            <span style={{ fontSize: '11px', color: '#d7d1cb' }}>BOOKING #{next.id}</span>
          </div>
          <div>
            <h3>{next.service}</h3>
            <p>{next.duration} · {next.location}</p>
          </div>
          <div className="session-bottom">
            <div className="trainer-mini">
              <div className="trainer-avatar">{next.initials}</div>
              <div>
                <strong>{next.trainer}</strong>
                <small>{next.payment}</small>
              </div>
            </div>
          </div>
        </div>

        <div className="countdown">
          <div className="countdown-head">
            <strong>Session starts in</strong>
            <span>{formatBookingDate(next.date).toUpperCase()}</span>
          </div>
          <div className="count-grid">
            <div className="count-cell">
              <strong id="days">{left.days}</strong>
              <small>DAYS</small>
            </div>
            <div className="count-cell">
              <strong id="hours">{left.hours}</strong>
              <small>HOURS</small>
            </div>
            <div className="count-cell">
              <strong id="mins">{left.mins}</strong>
              <small>MINUTES</small>
            </div>
          </div>
          <div>
            <div className="detail-line">
              <span>◷</span>
              <span>
                <b>{formatBookingDate(next.date)}</b>
                <br />
                {next.time}
              </span>
            </div>
            <div className="detail-line">
              <span>⌖</span>
              <span>
                <b>{next.location}</b>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="booking-list" id="upcomingList">
        {upcoming.map((b) => {
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
