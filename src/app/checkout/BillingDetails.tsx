'use client';

// Where the receipt goes. Read-only on purpose: checkout has no mandate to
// change the account, and a name edited on the way to payment would disagree
// with the invoice the server raises.
//
// Split out of `Checkout.tsx` under the 200-line rule.

import Link from 'next/link';

export function BillingDetails({
  who,
}: {
  who: { name: string; email: string; mobile: string };
}) {
  return (
    <section className="checkout-card">
      <div className="eyebrow">02 / Billing details</div>
      <h2>WHERE SHOULD WE SEND YOUR RECEIPT?</h2>
      <p className="muted">These come from your account.</p>

      <div className="payment-fields">
        <div className="field">
          <label htmlFor="fullName">Full name</label>
          <input id="fullName" readOnly={true} value={who.name} />
        </div>
        <div className="field">
          <label htmlFor="phone">Mobile number</label>
          <input id="phone" readOnly={true} value={who.mobile} />
        </div>
        <div className="field full">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            readOnly={true}
            value={who.email}
            placeholder="Add one in your profile"
          />
        </div>
        <div className="field full">
          <Link
            href="/profile"
            style={{ fontSize: '10px', color: 'var(--orange)', fontWeight: 700 }}
          >
            Change these in your profile →
          </Link>
        </div>
      </div>
    </section>
  );
}
