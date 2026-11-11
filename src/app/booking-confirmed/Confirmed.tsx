'use client';

// The live confirmation (PDF §5.7: "generate and display the booking
// reference" and "show the relevant booking status"). Everything here came
// from the server's own record of the booking — the demo showed a fixed
// HF-261103-4827 for ₹540 paid by UPI.
//
// The headline follows `paymentStatus`, not the fact that the customer
// arrived on this page: a booking still PENDING_PAYMENT says so and offers
// the way back to checkout, because the spec forbids confirming on the
// strength of a client-side payment response alone.

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { clockOf, getBookingDetail } from '@/lib/booking';
import type { BookingDetail } from '@/lib/booking';
import { formatBookingDate } from '@/data/bookings';

const money = (n: number | string) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

const initialsOf = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '—';

export function Confirmed() {
  const router = useRouter();
  const params = useSearchParams();
  const bookingId = params.get('booking') ?? '';

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Derived, not set in an effect: whether the link carries a booking is
  // known at render time, so there is nothing to wait for.
  const missing = bookingId ? null : 'No booking reference in the link.';

  useEffect(() => {
    if (!bookingId) return;

    let cancelled = false;

    void (async () => {
      const result = await getBookingDetail(bookingId);
      if (cancelled) return;

      if (result.unauthorised) {
        router.replace('/login');
        return;
      }

      setError(result.error ?? null);
      setBooking(result.booking ?? null);
    })();

    return () => {
      cancelled = true;
    };
  }, [bookingId, router]);

  const problem = missing ?? error;

  if (problem) {
    return (
      <section className="success-card">
        <div className="card-body">
          <div className="section-title">We could not open that booking</div>
          <p className="help">{problem}</p>
          <div className="actions"><Link className="btn" href="/my-bookings">Go to My Bookings</Link></div>
        </div>
      </section>
    );
  }

  if (!booking) {
    return (
      <section className="success-card">
        <div className="card-body"><div className="section-title">Loading your confirmation…</div></div>
      </section>
    );
  }

  const paid = booking.paymentStatus === 'PAID';
  const first = booking.sessions[0];
  const trainer = first?.instructor;

  return (
    <section className="success-card">
      <div className="success-top">
        <div className="checkmark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12 4 4L19 6"></path>
          </svg>
        </div>
        <div className="eyebrow">You&apos;re one step closer</div>
        <h1>{paid ? 'Booking confirmed!' : 'Booking created'}</h1>
        <p>
          {paid
            ? 'Your session is in the calendar. The details are below so you can get ready with confidence.'
            : 'Your slot is held while the payment is completed. Finish paying to confirm the session.'}
        </p>
        <div className="ref-pill">
          <span>BOOKING ID</span>
          <strong id="bookingId">{booking.code}</strong>
          <button
            type="button"
            id="copyId"
            onClick={() => {
              void navigator.clipboard?.writeText(booking.code).then(() => setCopied(true));
            }}
          >
            {copied ? 'COPIED' : 'COPY ID'}
          </button>
        </div>
      </div>

      <div className="card-body">
        <div className="notice">
          <div className="symbol">{paid ? '✓' : '!'}</div>
          <div>
            <strong>
              {paid ? 'Payment successful · Booking confirmed' : `Payment ${booking.paymentStatus.toLowerCase()} · Awaiting payment`}
            </strong>
            <p>
              {paid
                ? 'A receipt is recorded against this booking in your account.'
                : 'The slot is held for a short while. You can complete the payment from My Bookings.'}
            </p>
          </div>
        </div>

        <div className="section-title">Your session</div>
        <div className="details">
          <div className="detail">
            <div className="label">Trainer</div>
            {trainer ? (
              <div className="trainer-row">
                <div className="avatar">{initialsOf(trainer.name)}</div>
                <div>
                  <div className="value">{trainer.name}</div>
                  {trainer.ratingAvg && <div className="sub">★ {Number(trainer.ratingAvg).toFixed(1)}</div>}
                </div>
              </div>
            ) : (
              <>
                <div className="value">Being assigned</div>
                <div className="sub">You will be told who is coming before the session.</div>
              </>
            )}
          </div>
          <div className="detail">
            <div className="label">Service booked</div>
            <div className="value">{booking.service?.name ?? 'Session'}</div>
            <div className="sub">
              {booking.service?.durationMin ?? 60} minutes
              {booking.sessions.length > 1 ? ` · ${booking.sessions.length} sessions` : ' · 1:1 session'}
            </div>
          </div>
          <div className="detail">
            <div className="label">Date &amp; time</div>
            <div className="value">{first ? formatBookingDate(first.sessionDate.slice(0, 10)) : '—'}</div>
            <div className="sub">
              {first ? `${clockOf(first.fromMinute)} – ${clockOf(first.toMinute)}` : ''}
            </div>
          </div>
          <div className="detail">
            <div className="label">Session location</div>
            <div className="value">{booking.address?.label ?? 'At your home'}</div>
            <div className="sub">{booking.address ? `${booking.address.line1} · ${booking.address.pincode}` : ''}</div>
          </div>
        </div>

        <div className="section-title">Payment summary</div>
        <div className="detail">
          <div className="price-row">
            <span>{booking.service?.name ?? 'Session'}</span>
            <span className="amount">{money(booking.grossAmount)}</span>
          </div>
          {booking.addons.map((row, index) => (
            <div className="price-row" key={index}>
              <span>{row.addon.name}</span>
              <span className="amount">—</span>
            </div>
          ))}
          <div className="price-row"><span>Travel</span><span className="amount">{money(booking.travelCharge)}</span></div>
          <div className="price-row"><span>Taxes</span><span className="amount">{money(booking.tax)}</span></div>
          {Number(booking.discount) > 0 && (
            <div className="price-row">
              <span>Discount</span>
              <span className="amount">−{money(booking.discount)}</span>
            </div>
          )}
          <div className="price-row total">
            <span>{paid ? 'Total paid' : 'Total payable'}</span>
            <span>{money(booking.payable)}</span>
          </div>
          <div style={{ marginTop: '8px' }}>
            <span className="payment-badge">{paid ? '✓ Paid' : 'Awaiting payment'}</span>
          </div>
        </div>

        <div className="actions">
          <Link className="btn" href="/my-bookings">My bookings</Link>
          <button className="btn outline" id="printBtn" type="button" onClick={() => window.print()}>
            Print confirmation ↗
          </button>
          <Link className="btn outline" href="/">Back to home</Link>
        </div>
        <p className="help">
          Need help with your session? <a href="mailto:support@hellofit.example">Contact HelloFit support</a>
        </p>
      </div>
    </section>
  );
}
