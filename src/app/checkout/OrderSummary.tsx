'use client';

// The order summary and the coupon field.
//
// **Every figure is the server's.** The breakup comes from
// `POST /bookings/quote` with the chosen package, so the headline amount is
// what the package costs for this service — not `Service.basePrice`, which is
// what this page showed until the package was carried through on
// 21 Nov 2026. Nothing here adds anything up, and the coupon is re-validated
// inside `POST /bookings` rather than trusted from the quote shown here.
//
// Split out of `Checkout.tsx` under the 200-line rule.

import { clockOf, dateParts } from '@/lib/clock';
import type { ApiService } from '@/lib/catalog';
import type { ApiAddress } from '@/lib/profile';
import type { Package } from '@/lib/packages';
import type { Quote } from '@/lib/booking';

const money = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export function OrderSummary({
  service,
  pack,
  sessionDate,
  fromMinute,
  toMinute,
  address,
  quote,
  coupon,
  onCoupon,
  onApply,
  couponNote,
  paying,
  onPay,
}: {
  service: ApiService | null;
  pack: Package | null;
  sessionDate: string;
  fromMinute: number;
  toMinute: number;
  address: ApiAddress | null;
  quote: Quote | null;
  coupon: string;
  onCoupon: (value: string) => void;
  onApply: () => void;
  couponNote: string | null;
  paying: boolean;
  onPay: () => void;
}) {
  const total = quote ? money(quote.payable) : '—';

  return (
    <div className="order-summary">
      <div className="eyebrow">Your order</div>
      <h2>BOOKING SUMMARY</h2>

      <div style={{ padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
        <div className="order-line">
          <span>Session</span>
          <strong id="summaryService">{service?.name ?? '—'}</strong>
        </div>
        <div className="order-line">
          <span>Package</span>
          <strong>
            {pack
              ? `${pack.name} · ${pack.sessionCount} ${pack.sessionCount === 1 ? 'session' : 'sessions'}`
              : '—'}
          </strong>
        </div>
        {/* dd-mm-yyyy, rule 4 — this line printed the ISO date. */}
        <div className="order-line">
          <span>Date</span>
          <strong id="summaryDate">{sessionDate ? dateParts(sessionDate).long : '—'}</strong>
        </div>
        <div className="order-line">
          <span>Session start</span>
          <strong id="summaryTime">{fromMinute ? clockOf(fromMinute) : '—'}</strong>
        </div>
        <div className="order-line">
          <span>Session end</span>
          <strong>{toMinute ? clockOf(toMinute) : '—'}</strong>
        </div>
        <div className="order-line">
          <span>Location</span>
          <strong id="summaryLocation">{address?.label ?? '—'}</strong>
        </div>
        <div className="order-line">
          <span>Duration</span>
          <strong id="summaryDuration">
            {service ? `${service.durationMin} minutes` : '—'}
          </strong>
        </div>
      </div>

      <div className="coupon-row">
        <input
          id="coupon"
          placeholder="Promo code"
          value={coupon}
          onChange={(e) => onCoupon(e.target.value.toUpperCase())}
        />
        <button onClick={onApply}>APPLY</button>
      </div>

      {couponNote ? (
        <div id="couponMessage" className="muted" style={{ marginTop: '7px' }}>
          {couponNote}
        </div>
      ) : null}

      <div style={{ paddingTop: '8px' }}>
        <div className="order-line">
          <span>{pack ? 'Package total' : 'Session fee'}</span>
          <strong id="fee">{quote ? money(quote.grossAmount) : '—'}</strong>
        </div>
        <div className="order-line">
          <span>Travel</span>
          <strong>{quote ? money(quote.travelCharge) : '—'}</strong>
        </div>
        <div className="order-line">
          <span>Taxes</span>
          <strong>{quote ? money(quote.tax) : '—'}</strong>
        </div>
        <div className="order-line">
          <span>Discount</span>
          <strong id="discount" style={{ color: '#57805d' }}>
            −{quote ? money(quote.discount) : '₹0'}
          </strong>
        </div>
        <div className="order-total">
          <span>Total payable</span>
          <strong id="total">{total}</strong>
        </div>
      </div>

      <button className="btn primary pay-button" onClick={onPay} disabled={paying || !quote}>
        🔒{' '}
        {paying ? (
          'Working…'
        ) : (
          <>
            Continue to Pay <span id="buttonAmount2">{total}</span>
          </>
        )}
      </button>

      <div className="secure-note">✓ Verified server-side before your booking is confirmed</div>
      <p className="fine-print">
        By continuing, you agree to HelloFit&apos;s Terms &amp; Conditions and Cancellation
        Policy.
      </p>
    </div>
  );
}
