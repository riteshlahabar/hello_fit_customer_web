'use client';

// "Your recent requests", read from `GET /app/customer/refunds`.
//
// The demo drew two invented cards and a "↻ Refresh demo" button that did
// nothing. The markup here is the client's — `.request`, `.request-top`,
// `.request-meta`, `.status` — and the refresh now refetches.
//
// **The status pill has three classes and the API has six states**, so they
// roll up: `review` while a refund is still moving, `processed` once it is
// approved or paid, `rejected` when it is refused or failed. The exact state
// is still printed in the meta line, so nothing is hidden by the rollup.
//
// The meta line answers "why this amount" with `slabApplied` — the refund
// policy slab that produced it (PDF 3.5). That is the one field a customer
// disputing a refund actually needs, and no demo card had it.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  humanSlab,
  listRefunds,
  refundTone,
  rupees,
  shortDate,
  type Refund,
} from '@/lib/billing';

const PILL: Record<string, string> = {
  ok: 'processed',
  bad: 'rejected',
  wait: 'review',
};

const WORDING: Record<Refund['status'], string> = {
  PENDING: 'Awaiting review',
  APPROVED: 'Approved',
  PROCESSING: 'Being processed',
  COMPLETED: 'Refunded',
  REJECTED: 'Declined',
  FAILED: 'Could not be processed',
};

function destination(refund: Refund): string {
  return refund.mode === 'WALLET'
    ? 'Credited to your HelloFit wallet'
    : 'Returned to your original payment method';
}

export function RefundList() {
  const [rows, setRows] = useState<Refund[] | null>(null);
  const [signedIn, setSignedIn] = useState(true);

  const load = useCallback(async () => {
    const refunds = await listRefunds();
    setSignedIn(refunds !== null);
    setRows(refunds ?? []);
  }, []);

  // Not `void load()` — `react-hooks/set-state-in-effect` rejects a setState
  // reached synchronously from an effect body, which is the same rule that was
  // right about `SidebarToggle` on 13 Nov. An async IIFE defers the write and
  // gives the cancelled flag somewhere to live.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const refunds = await listRefunds();
      if (cancelled) return;

      setSignedIn(refunds !== null);
      setRows(refunds ?? []);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="card">
      <div className="card-head">
        <div>
          <h2>Your refunds</h2>
          <div className="sub">
            Every refund raised against one of your bookings.
          </div>
        </div>
        <button
          className="secondary"
          id="refreshRequests"
          onClick={() => void load()}
        >
          ↻ Refresh
        </button>
      </div>

      <div className="request-list" id="requestList">
        {rows?.map((refund) => (
          <article className="request" key={refund.id}>
            <div className="request-top">
              <div>
                <h3>
                  {refund.service ?? 'Session'} · {refund.bookingCode}
                </h3>
                <p>
                  {rupees(refund.amount)} · {destination(refund)}
                </p>
              </div>
              <span className={`status ${PILL[refundTone(refund.status)]}`}>
                {WORDING[refund.status]}
              </span>
            </div>
            <div className="request-meta">
              <span>
                Booking: <strong>{refund.bookingCode}</strong>
              </span>
              <span>
                Raised: <strong>{shortDate(refund.requestedAt)}</strong>
              </span>
              {refund.slabApplied && (
                <span>
                  Policy applied: <strong>{humanSlab(refund.slabApplied)}</strong>
                </span>
              )}
              {refund.processedAt && (
                <span>
                  Settled: <strong>{shortDate(refund.processedAt)}</strong>
                </span>
              )}
            </div>
          </article>
        ))}
      </div>

      {!signedIn && (
        <div className="empty">
          <Link href="/login?next=%2Frefunds">Log in</Link> to see your refunds.
        </div>
      )}
      {signedIn && rows === null && (
        <div className="empty">Loading your refunds…</div>
      )}
      {signedIn && rows?.length === 0 && (
        <div className="empty">
          No refunds yet. Cancelling a session from{' '}
          <Link href="/my-bookings">My Bookings</Link> raises one, and the
          amount follows the cancellation policy below.
        </div>
      )}
    </section>
  );
}
