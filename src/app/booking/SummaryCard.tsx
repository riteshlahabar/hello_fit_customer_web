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
  /**
   * Step 4 only, because that is where the booking is agreed to (client,
   * 23-11-2026).
   *
   * The card used to carry a **Continue to Payment** button behind this flag.
   * It is gone: the review step already has one in `.bottom-actions`, so the
   * screen offered the same action twice (client, 23-11-2026 — the second
   * instruction that day about this card; the first moved the button to step
   * 4 at all, when it sat next to "choose a service"). Only the terms
   * sentence is left, and it belongs to the button that remains.
   */
  showTerms,
}: {
  service: ApiService | null;
  pack: Package | null;
  date: string;
  slot: Slot | null;
  address: ApiAddress | null;
  quote: Quote | null;
  showTerms: boolean;
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

        {/* The disclosure stays, the button does not — the review step's own
            "Continue to Payment" in `.bottom-actions` is the one. */}
        {showTerms ? (
          <p className="terms">
            By continuing, you agree to the booking terms and cancellation policy shown
            at checkout.
          </p>
        ) : null}
        <div className="secure">♧ Secure checkout</div>
      </section>
    </aside>
  );
}
