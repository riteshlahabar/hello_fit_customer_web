'use client';

// The live half of the session page: the service, the day and time, the
// address, the assigned trainer and the session's own status, read back from
// `/app/customer/bookings/:id`.
//
// Reached as `/session-details?booking=<id>`, and `?session=<id>` picks one
// occurrence of a package. Without a booking in the link there is nothing to
// show, so the page says so and points at My Bookings rather than rendering
// the demo's "Full Body Strength · Sneha Patil".
//
// The status label is the session's real `SessionStatus` — thirteen of them
// exist; they are shown in words rather than rolled up, because on a single
// session "cancelled by the teacher" and "you cancelled" are different news.

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getBookingDetail } from '@/lib/booking';
import { clockOf } from '@/lib/clock';
import type { BookingDetail } from '@/lib/booking';
import { WorkoutGuide, ReadinessChecklist, EquipmentAndSafety } from './WorkoutGuide';
import { formatBookingDate } from '@/data/bookings';

const STATUS_WORDS: Record<string, string> = {
  PENDING_PAYMENT: 'Awaiting payment',
  CONFIRMED: 'Confirmed',
  ASSIGNED: 'Trainer assigned',
  EN_ROUTE: 'Trainer on the way',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED_BY_CUSTOMER: 'Cancelled by you',
  CANCELLED_BY_TEACHER: 'Cancelled by the trainer',
  CANCELLED_BY_ADMIN: 'Cancelled by HelloFit',
  NO_SHOW_CUSTOMER: 'Marked as no-show',
  NO_SHOW_TEACHER: 'Trainer did not attend',
  REASSIGNMENT_NEEDED: 'Finding another trainer',
  RESCHEDULE_REQUESTED: 'Reschedule requested',
};

const initialsOf = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '—';

export function SessionDetails() {
  const router = useRouter();
  const params = useSearchParams();
  const bookingId = params.get('booking') ?? '';
  const sessionId = params.get('session') ?? '';

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Derived rather than set in an effect: whether the link names a booking is
  // known at render time.
  const missing = bookingId ? null : 'Open a session from My Bookings to see its details.';

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

  const session =
    booking?.sessions.find((s) => s.id === sessionId) ?? booking?.sessions[0] ?? null;

  const service = booking?.service;
  const trainer = session?.instructor;
  const minutes =
    session && session.toMinute > session.fromMinute
      ? session.toMinute - session.fromMinute
      : (service?.durationMin ?? 60);

  const problem = missing ?? error;

  if (problem) {
    return (
      <section className="hero">
        <div className="crumbs"><Link href="/my-bookings">My Bookings</Link>　/　Session Details</div>
        <div className="hero-grid">
          <div>
            <div className="eyebrow">Nothing to show</div>
            <h1>SESSION<br />DETAILS</h1>
            <p>{problem}</p>
            <div className="hero-actions"><Link className="btn primary" href="/my-bookings">Go to My Bookings</Link></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="hero">
        <div className="crumbs">
          <Link href="/dashboard">Dashboard</Link>　/　<Link href="/my-bookings">My Bookings</Link>　/　Session Details
        </div>
        <div className="hero-grid">
          <div>
            <div className="eyebrow">{session?.status === 'COMPLETED' ? 'Completed session' : 'Your session'}</div>
            <h1>{(service?.name ?? 'Your session').toUpperCase()}</h1>
            <p>
              {booking
                ? `Booking ${booking.code}. The details below come straight from your booking.`
                : 'Loading your session…'}
            </p>
            <div className="hero-meta">
              <span className="pill orange">🏋️ {service?.name ?? 'Session'}</span>
              <span className="pill">◷ {minutes} minutes</span>
              <span className="pill">▦ {session ? STATUS_WORDS[session.status] ?? session.status : '—'}</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-card">
              <div className="visual-top">
                <div>
                  <div className="bigicon">🏋️‍♀️</div>
                  <strong>Train with purpose.</strong>
                  <span>Move well, build steadily.</span>
                </div>
                <div className="visual-time">{minutes} MIN</div>
              </div>
              <div style={{ height: '1px', background: '#eee4da', margin: '14px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                <span>Session <b>{session ? `${session.sequence} of ${booking?.sessions.length}` : '—'}</b></span>
                <span>Starts <b>{session ? clockOf(session.fromMinute) : '—'}</b></span>
                <span>Paid <b>{booking?.paymentStatus === 'PAID' ? 'Yes' : 'No'}</b></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stat"><small>Duration</small><strong>{minutes} min</strong><em>Warm-up to cooldown</em></div>
        <div className="stat"><small>Date</small><strong style={{ fontSize: '17px' }}>{session ? formatBookingDate(session.sessionDate.slice(0, 10)) : '—'}</strong><em>{session ? `${clockOf(session.fromMinute)} – ${clockOf(session.toMinute)}` : ''}</em></div>
        <div className="stat"><small>Location</small><strong style={{ fontSize: '17px' }}>{booking?.address?.label ?? '—'}</strong><em>{booking?.address?.pincode ?? ''}</em></div>
        <div className="stat"><small>Session status</small><strong id="sessionStatus" style={{ fontSize: '17px' }}>{session ? STATUS_WORDS[session.status] ?? session.status : '—'}</strong><em id="statusNote">{booking?.paymentStatus === 'PAID' ? 'Payment received' : 'Awaiting payment'}</em></div>
      </section>

      <div className="layout">
        <div>
          <WorkoutGuide />
          <ReadinessChecklist />
        </div>

        <aside>
          <section className="panel">
            <div className="panel-head">
              <div><h2>Session details</h2><div className="panel-sub">Your booked appointment.</div></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '19px' }}>📅</span>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800' }}>
                    {session ? formatBookingDate(session.sessionDate.slice(0, 10)) : '—'}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '3px' }}>
                    {session ? `${clockOf(session.fromMinute)} – ${clockOf(session.toMinute)}` : ''}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '19px' }}>📍</span>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800' }}>{booking?.address?.label ?? '—'}</div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '3px' }}>
                    {booking?.address ? `${booking.address.line1} · ${booking.address.pincode}` : ''}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '19px' }}>🧾</span>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800' }}>Booking {booking?.code ?? '—'}</div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '3px' }}>
                    {booking ? `₹${Number(booking.payable).toLocaleString('en-IN')} · ${booking.paymentStatus}` : ''}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <div><h2>Your trainer</h2><div className="panel-sub">Session guidance</div></div>
            </div>
            {trainer ? (
              <div className="trainer">
                <div className="trainer-avatar">{initialsOf(trainer.name)}</div>
                <div>
                  <strong>{trainer.name}</strong>
                  <span>{trainer.ratingAvg ? `★ ${Number(trainer.ratingAvg).toFixed(1)}` : 'Fitness trainer'}</span>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '11px', color: 'var(--muted)', margin: 0 }}>
                A trainer is being assigned. You will be told who is coming before the session.
              </p>
            )}
            <p style={{ fontSize: '10px', lineHeight: '1.8', color: 'var(--muted)', margin: '14px 0 0' }}>
              Anything your trainer should know in advance can go in the note on your profile.
            </p>
          </section>

          <EquipmentAndSafety />
        </aside>
      </div>
    </>
  );
}
