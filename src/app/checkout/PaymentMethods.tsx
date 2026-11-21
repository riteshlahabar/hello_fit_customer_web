'use client';

// The design's four payment tiles, which map to two real paths: UPI, card and
// net banking all go to the gateway, which collects the instrument inside its
// own sheet (that choice does not belong on this page), and Wallet is the
// HelloFit balance, which settles server-side with no gateway at all.
//
// Split out of `Checkout.tsx` on 21 Nov 2026, when carrying the package
// through took that file to 370 lines.

const money = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export type Method = 'upi' | 'card' | 'netbanking' | 'wallet';

const METHODS: { id: Method; icon: string; title: string; sub: string }[] = [
  { id: 'upi', icon: '📱', title: 'UPI', sub: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', icon: '💳', title: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', icon: '🏦', title: 'Net Banking', sub: 'Pay through your bank' },
  { id: 'wallet', icon: '👛', title: 'HelloFit Wallet', sub: 'Pay from your balance' },
];

export function PaymentMethods({
  method,
  onMethod,
  wallet,
}: {
  method: Method;
  onMethod: (next: Method) => void;
  /** The customer's wallet balance, once known. */
  wallet: number | null;
}) {
  return (
    <section className="checkout-card">
      <div className="eyebrow">01 / Payment method</div>
      <h2>HOW WOULD YOU LIKE TO PAY?</h2>
      <p className="muted">UPI, card and net banking are collected by the payment gateway.</p>

      <div className="payment-methods">
        {METHODS.map((option) => (
          <button
            key={option.id}
            className={`payment-method${method === option.id ? ' selected' : ''}`}
            data-method={option.id}
            onClick={() => onMethod(option.id)}
          >
            <span className="pay-icon">{option.icon}</span>
            <span>
              <strong>{option.title}</strong>
              <small>
                {option.id === 'wallet' && wallet !== null
                  ? `${money(wallet)} available`
                  : option.sub}
              </small>
            </span>
            <span className="method-check">{method === option.id ? '●' : ''}</span>
          </button>
        ))}
      </div>

      <div className="notice">
        🔒 <strong>Your payment is handled by the gateway.</strong> Card and UPI details are
        entered in the gateway&apos;s own window — HelloFit never sees or stores them, and a
        payment is confirmed only after the server verifies it.
      </div>
    </section>
  );
}
