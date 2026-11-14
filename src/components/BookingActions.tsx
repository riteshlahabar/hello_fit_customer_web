'use client';

// The right-hand column of one booking card — the price block and the row's
// buttons.
//
// Split out of `BookingList` on 13 Nov 2026 (Phase 5): wiring three of these
// buttons to real routes took that file past the 200-line rule, and the
// buttons are the part with the rules worth reading on their own.
//
// Three now go somewhere real — View details to `/session-details`, View
// receipt to `/billing`, Book again to `/booking` with the same service and
// trainer preselected. **Reschedule and Cancel are deliberately still
// inert**: cancelling computes a refund against the slab in `app_settings`,
// so it moves money, and the client's design has no confirmation step for
// either. A one-click cancel behind no confirmation is worse than a button
// that says it is not available yet. Both need the client's word first.

import Link from 'next/link';
import { money, type Booking } from '@/data/bookings';
import { useToast } from './Toast';

/**
 * "Book again" — the same service, and the same trainer when the booking had
 * one. Each id is only added when it is there: `?service=` with an empty
 * value is a filter the customer never chose, and the wizard would open on
 * nothing selected.
 */
function bookAgainHref(booking: Booking): string {
  const params = new URLSearchParams();
  if (booking.serviceId) params.set('service', booking.serviceId);
  if (booking.instructorId) params.set('trainer', booking.instructorId);

  const query = params.toString();
  return query ? `/booking?${query}` : '/booking';
}

export function BookingActions({ b }: { b: Booking }) {
  const showToast = useToast();

  return (
    <aside className="booking-side">
      <div className="price-wrap">
        <div className="price-label">Session total</div>
        <div className="price">{money(b.price)}</div>
        <div className="ref">Ref: {b.id}</div>
      </div>

      {/* `/session-details` has read `bookings/:id` since 11 Nov and
          nothing linked to it. A static fallback row has no uuid, so
          it keeps the toast rather than linking nowhere. */}
      {b.bookingId ? (
        <Link
          className="btn btn-light"
          href={`/session-details?booking=${b.bookingId}`}
        >
          View details ↗
        </Link>
      ) : (
        <button
          className="btn btn-light"
          onClick={() => showToast(`Booking ${b.id} — sign in to open the full detail.`)}
        >
          View details ↗
        </button>
      )}

      {b.status === 'upcoming' ? (
        <>
          {/* Reschedule and Cancel are deliberately NOT wired here.
              Cancel moves money — it computes a refund against the
              slab in `app_settings` — and neither has a confirmation
              step in the client's design. Both need the client's word
              on the dialog before they can exist; a one-click cancel
              behind no confirmation is the worse outcome. */}
          <button
            className="btn btn-primary"
            onClick={() => showToast('Reschedule is not available yet.')}
          >
            Reschedule
          </button>
          <button
            className="btn btn-light"
            onClick={() => showToast('Cancellation is not available on the website yet.')}
          >
            Cancel booking
          </button>
        </>
      ) : (
        <>
          <Link className="btn btn-light" href="/billing">
            View receipt
          </Link>
          {b.status === 'completed' && (
            <Link
              className="btn btn-primary"
              href={bookAgainHref(b)}
            >
              Book again
            </Link>
          )}
        </>
      )}
    </aside>
  );
}
