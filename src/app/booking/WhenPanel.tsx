'use client';

// Step 2 — the date, and the time the session **starts**.
//
// **Client, 21 Nov 2026:** "give choice to select time by customer in slot …
// but it is according to session time which is already set — if customer
// select 8.00am then end session automatic go on 9.00am. Instead of from/to
// use start session / end session." So there is one control, not two: the
// customer picks a start and the end is the service's own length added to it.
// A second control could disagree with the service; this cannot.
//
// The ends come from the slot the API returned rather than being recomputed
// here, so a service whose duration changed between the grid and the click
// can never leave the page showing one length and the booking carrying
// another.
//
// **Availability is the backend's answer.** `GET /slots` already applies the
// institute window, the lead time, the 30-minute granularity, approved leave,
// the daily cap and every existing session widened by the travel buffer. An
// empty answer is a fact, not an error — US-W08.

import { clockOf, dateParts, weekdayOf } from '@/lib/clock';
import type { Slot } from '@/lib/slots';

export function WhenPanel({
  days,
  date,
  onDate,
  slots,
  slot,
  onSlot,
  loading,
  note,
  /** Weekdays the chosen package allows; empty means any. */
  allowedWeekdays,
  /** No saved address yet, so there is nothing to compute availability for. */
  needsAddress,
  onGoToLocation,
}: {
  days: string[];
  date: string;
  onDate: (iso: string) => void;
  slots: Slot[];
  slot: Slot | null;
  onSlot: (slot: Slot) => void;
  loading: boolean;
  note: string | null;
  allowedWeekdays: number[];
  needsAddress: boolean;
  onGoToLocation: () => void;
}) {
  return (
    <>
      <div className="date-grid" id="dateGrid">
        {days.map((day) => {
          const parts = dateParts(day);
          // A package may be sold for certain weekdays only. Disabled rather
          // than hidden: a gap in the strip with no reason given reads as a
          // bug, and the API would refuse the booking anyway.
          const blocked =
            allowedWeekdays.length > 0 && !allowedWeekdays.includes(weekdayOf(day));

          return (
            <button
              key={day}
              type="button"
              className={`date-option${day === date ? ' selected' : ''}`}
              data-date={parts.long}
              disabled={blocked}
              title={blocked ? 'Your package does not cover this weekday' : undefined}
              onClick={() => onDate(day)}
            >
              <small>{parts.weekday}</small>
              <strong>{parts.day}</strong>
              <small>{parts.monthName}</small>
            </button>
          );
        })}
      </div>

      <div className="subheading">Session start time</div>

      {needsAddress ? (
        <p className="muted">
          Times depend on where your trainer has to travel to, so add a session address
          first.{' '}
          <button type="button" className="text-link" onClick={onGoToLocation}>
            Add an address →
          </button>
        </p>
      ) : loading ? (
        <p className="muted">Checking availability…</p>
      ) : (
        <>
          <div className="time-grid" id="timeGrid">
            {slots.map((option) => (
              <button
                key={option.fromMinute}
                type="button"
                className={`time-option${slot?.fromMinute === option.fromMinute ? ' selected' : ''}`}
                onClick={() => onSlot(option)}
              >
                {clockOf(option.fromMinute)}
              </button>
            ))}
          </div>

          {slot ? (
            <p className="session-span">
              Session ends at <strong>{clockOf(slot.toMinute)}</strong>
              <small>
                {' '}
                ({slot.toMinute - slot.fromMinute} minute session, set by the service)
              </small>
            </p>
          ) : slots.length > 0 ? (
            <p className="muted">Pick a start time — the end follows from the session length.</p>
          ) : null}
        </>
      )}

      {note && !needsAddress ? (
        <p className="muted" style={{ marginTop: '10px' }}>
          {note}
        </p>
      ) : null}
    </>
  );
}
