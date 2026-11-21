'use client';

// Step 4 — everything chosen, restated once, before any money moves.
//
// The account fields are read-only here: this screen has no mandate to change
// the account, and a name edited on the way to payment would disagree with
// the invoice. The booking facts above them are the ones the customer just
// chose, repeated because the three panels that collected them are now behind
// tabs and cannot all be seen at once.

import Link from 'next/link';
import { clockOf, dateParts } from '@/lib/clock';
import type { ApiService } from '@/lib/catalog';
import type { ApiAddress } from '@/lib/profile';
import type { Package } from '@/lib/packages';
import type { Slot } from '@/lib/slots';

export function ReviewPanel({
  who,
  service,
  pack,
  date,
  slot,
  address,
  goal,
  level,
}: {
  who: { name: string; email: string; mobile: string };
  service: ApiService | null;
  pack: Package | null;
  date: string;
  slot: Slot | null;
  address: ApiAddress | null;
  goal: string;
  level: string;
}) {
  return (
    <>
      <dl className="review-facts">
        <div>
          <dt>Service</dt>
          <dd>{service?.name ?? '—'}</dd>
        </div>
        <div>
          <dt>Package</dt>
          <dd>{pack?.name ?? '—'}</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>{date ? dateParts(date).long : '—'}</dd>
        </div>
        <div>
          <dt>Session start</dt>
          <dd>{slot ? clockOf(slot.fromMinute) : '—'}</dd>
        </div>
        <div>
          <dt>Session end</dt>
          <dd>{slot ? clockOf(slot.toMinute) : '—'}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>
            {address ? (
              <>
                {address.label}
                <small>
                  {address.line1} · {address.pincode}
                </small>
              </>
            ) : (
              '—'
            )}
          </dd>
        </div>
        <div>
          <dt>Goal</dt>
          <dd>{goal}</dd>
        </div>
        <div>
          <dt>Experience</dt>
          <dd>{level}</dd>
        </div>
      </dl>

      <div className="field-grid">
        <div className="field">
          <label htmlFor="customerName">Your full name</label>
          <input id="customerName" readOnly={true} value={who.name} />
        </div>
        <div className="field">
          <label htmlFor="customerEmail">Email address</label>
          <input
            id="customerEmail"
            type="email"
            readOnly={true}
            value={who.email}
            placeholder="Add one in your profile"
          />
        </div>
        <div className="field full">
          <label htmlFor="customerPhone">Mobile number</label>
          <input id="customerPhone" type="tel" readOnly={true} value={who.mobile} />
        </div>
      </div>

      <p className="review-note">
        These come from your account. Change them in <Link href="/profile">your profile</Link>.
      </p>
    </>
  );
}
