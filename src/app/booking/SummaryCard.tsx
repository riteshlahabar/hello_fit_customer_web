'use client';

// The booking summary beside the panels.
//
// **Every figure is the server's.** The breakup comes from
// `POST /bookings/quote` with the chosen package, so the "Session fee" is
// what the package costs for this service — not `Service.basePrice`, which is
// what the page showed before the package was carried through (client,
// 21 Nov 2026). Nothing here adds anything up.

import { clockOf, dateParts } from '@/lib/clock';
import type { ApiService } from '@/lib/catalog';
import type { ApiAddress } from '@/lib/profile';
import type { Package } from '@/lib/packages';
import type { Quote } from '@/lib/booking';
import type { Slot } from '@/lib/slots';

const money = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export function SummaryCard({
  service,
  pack,
  date,
  slot,
  address,
  quote,
  onContinue,
  ready,
}: {
  service: ApiService | null;
  pack: Package | null;
  date: string;
  slot: Slot | null;
  address: ApiAddress | null;
  quote: Quote | null;
  onContinue: () => void;
  ready: boolean;
}) {
  return (
    <aside>
      <section className="summary-card">
        <h2>Booking summary</h2>
        <div className="summary-details">
          <div className="summary-line">
            <span>Service</span>
            <strong id="sumService">{service?.name ?? '—'}</strong>
          </div>
          <div className="summary-line">
            <span>Package</span>
            <strong>{pack?.name ?? '—'}</strong>
          </div>
          <div className="summary-line">
            <span>Date</span>
            <strong id="sumDate">{date ? dateParts(date).long : '—'}</strong>
          </div>
          <div className="summary-line">
            <span>Session start</span>
            <strong id="sumTime">{slot ? clockOf(slot.fromMinute) : 'Choose a time'}</strong>
          </div>
          <div className="summary-line">
            <span>Session end</span>
            <strong>{slot ? clockOf(slot.toMinute) : '—'}</strong>
          </div>
          <div className="summary-line">
            <span>Location</span>
            <strong id="sumLocation">{address?.label ?? '—'}</strong>
          </div>
          <div className="summary-line">
            <span>Sessions</span>
            <strong>
              {pack
                ? `${pack.sessionCount}${pack.freeSessionCount ? ` + ${pack.freeSessionCount} free` : ''}`
                : '—'}
            </strong>
          </div>
        </div>

        <div className="price-breakdown">
          <div className="summary-line">
            <span>Package total</span>
            <strong id="sumFee">{quote ? money(quote.grossAmount) : '—'}</strong>
          </div>
          <div className="summary-line">
            <span>Travel</span>
            <strong id="sumPlatform">{quote ? money(quote.travelCharge) : '—'}</strong>
          </div>
          <div className="summary-line">
            <span>Taxes</span>
            <strong id="sumTax">{quote ? money(quote.tax) : '—'}</strong>
          </div>
          <div className="summary-line total">
            <span>Total</span>
            <strong id="sumTotal">{quote ? money(quote.payable) : '—'}</strong>
          </div>
        </div>

        <button className="btn primary" disabled={!ready} onClick={onContinue}>
          Continue to Payment ↗
        </button>
        <p className="terms">
          By continuing, you agree to the booking terms and cancellation policy shown at
          checkout.
        </p>
        <div className="secure">♧ Secure checkout</div>
      </section>

      <section className="help-card">
        <h3>Need a hand?</h3>
        <p>
          Questions about your session? Our support experience can help you through
          booking.
        </p>
        <a href="mailto:support@hellofit.example" style={{ display: 'inline-block' }}>
          Contact support →
        </a>
      </section>
    </aside>
  );
}
