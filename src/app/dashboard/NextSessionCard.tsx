'use client';

// The "Your next session" card and its countdown.
//
// Split out of `LiveSections.tsx` on 23-11-2026 when the countdown became a
// live clock — the file was heading past the 200-line rule. Markup, classes
// and ids are the demo's, unchanged.
//
// This component is pure: it draws the session it is handed against the
// instant it is handed. Choosing *which* session is `LiveSections`' job, and
// the ticking clock is `useNow`'s.

import { formatBookingDate, type Booking } from '@/data/bookings';
import { sessionWindow } from '@/lib/clock';

const pad = (value: number) => String(Math.floor(value)).padStart(2, '0');

/** Whole days / hours / minutes from `now` until the session starts. */
function split(left: number) {
  return {
    days: pad(left / 86_400_000),
    hours: pad((left / 3_600_000) % 24),
    mins: pad((left / 60_000) % 60),
  };
}

export function NextSessionCard({ booking, now }: { booking: Booking; now: number }) {
  const { start } = sessionWindow(booking);

  // The caller has already dropped sessions whose end time has passed, so
  // "started" here means underway, not over.
  const started = now >= start;
  const left = split(Math.max(0, start - now));

  return (
    <>
      <div className="session-card">
        <div className="session-top">
          <span className="pill">
            <span className="dot"></span> {started ? 'SESSION IN PROGRESS' : 'UPCOMING SESSION'}
          </span>
          <span style={{ fontSize: '11px', color: '#d7d1cb' }}>BOOKING #{booking.id}</span>
        </div>
        <div>
          <h3>{booking.service}</h3>
          <p>{booking.duration} · {booking.location}</p>
        </div>
        <div className="session-bottom">
          <div className="trainer-mini">
            <div className="trainer-avatar">{booking.initials}</div>
            <div>
              <strong>{booking.trainer}</strong>
              <small>{booking.payment}</small>
            </div>
          </div>
        </div>
      </div>

      <div className="countdown">
        <div className="countdown-head">
          <strong>{started ? 'Session is underway' : 'Session starts in'}</strong>
          <span>{formatBookingDate(booking.date).toUpperCase()}</span>
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
              <b>{formatBookingDate(booking.date)}</b>
              <br />
              {booking.time}
            </span>
          </div>
          <div className="detail-line">
            <span>⌖</span>
            <span>
              <b>{booking.location}</b>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
