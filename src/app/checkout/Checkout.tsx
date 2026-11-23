'use client';

// Live checkout and payment (PDF §5.8 / US-W09).
//
// What arrives in the URL is the whole booking: the service, **the package**,
// the address, the day, the start and end minute, the
// note and the chosen trainer. The package is the one that was missing until
// 21 Nov 2026 — without it every quote came back as one session of
// `Service.basePrice`, which is what the client saw as "it shows the base
// price, not the service price".
//
// Split on 21 Nov 2026 under the 200-line rule: the tiles are
// `PaymentMethods`, the receipt fields `BillingDetails`, the aside
// `OrderSummary`, the reads `useCheckoutData`, and the pay flow `usePay` —
// which is where the order of operations and the three settlement paths are
// documented.

import { useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PaymentMethods, type Method } from './PaymentMethods';
import { BillingDetails } from './BillingDetails';
import { OrderSummary } from './OrderSummary';
import { useCheckoutData } from './useCheckoutData';
import { usePay } from './usePay';

const money = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export function Checkout() {
  const params = useSearchParams();

  const serviceId = params.get('service') ?? '';
  /** What prices the booking — see the file comment. */
  const packageId = params.get('package') ?? '';
  const addressId = params.get('address') ?? '';
  const sessionDate = params.get('date') ?? '';
  const fromMinute = Number(params.get('from') ?? '0');
  const toMinute = Number(params.get('to') ?? '0');
  const notes = params.get('notes') ?? '';
  /**
   * The trainer chosen on the profile or the search page, forwarded by the
   * booking wizard. Reaches `instructorId` on `POST /bookings`; absent, the
   * API auto-assigns as every website booking did before Phase 5.
   */
  const trainerId = params.get('trainer') ?? '';

  const [method, setMethod] = useState<Method>('upi');
  const [coupon, setCoupon] = useState('');
  const [applied, setApplied] = useState('');

  const dropCoupon = useCallback(() => setApplied(''), []);

  const data = useCheckoutData({
    serviceId,
    packageId,
    addressId,
    applied,
    onCouponRefused: dropCoupon,
  });

  const complete = Boolean(serviceId && addressId && sessionDate && fromMinute >= 0);

  const { pay, paying, status } = usePay({
    complete,
    serviceId,
    packageId,
    addressId,
    sessionDate,
    fromMinute,
    toMinute,
    trainerId,
    coupon: applied,
    notes,
    method,
    who: data.who,
  });

  const total = data.quote ? money(data.quote.payable) : '—';

  return (
    <div className="checkout-layout">
      <div>
        <PaymentMethods method={method} onMethod={setMethod} wallet={data.wallet} />
        <BillingDetails who={data.who} />

        <div className="back-row">
          <Link className="text-btn" href="/booking">
            ← Back to booking
          </Link>
          <button
            className="btn primary"
            onClick={() => void pay()}
            disabled={paying || !data.quote}
          >
            {paying ? (
              'Working…'
            ) : (
              <>
                Continue to Pay · <span id="buttonAmount">{total}</span> →
              </>
            )}
          </button>
        </div>

        {status ? (
          <p className="muted" style={{ marginTop: '10px' }}>
            {status}
          </p>
        ) : null}
      </div>

      <aside>
        <OrderSummary
          service={data.service}
          pack={data.pack}
          sessionDate={sessionDate}
          fromMinute={fromMinute}
          toMinute={toMinute}
          address={data.address}
          quote={data.quote}
          coupon={coupon}
          onCoupon={setCoupon}
          onApply={() => setApplied(coupon.trim())}
          couponNote={data.couponNote}
          paying={paying}
          onPay={() => void pay()}
        />

        <div className="checkout-card" style={{ marginTop: '15px' }}>
          <strong style={{ fontSize: '11px' }}>Need help?</strong>
          <p className="muted" style={{ margin: '5px 0 10px' }}>
            Our support team can help with your booking or payment questions.
          </p>
          <a
            href="mailto:support@hellofit.example"
            style={{ fontSize: '10px', color: 'var(--orange)', fontWeight: 700 }}
          >
            Contact HelloFit Support →
          </a>
        </div>
      </aside>
    </div>
  );
}
