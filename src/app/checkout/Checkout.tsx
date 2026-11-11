'use client';

// Live checkout and payment (PDF §5.8 / US-W09).
//
// The order of operations matters and is the spec's, not the design's:
//
//   quote (with the coupon)  →  create the booking  →  gateway  →  verify
//
// The booking is created *here* rather than on the booking page because the
// coupon lives on this screen: a discount has to be priced into the booking
// before it exists, and `Booking.payable` is fixed once it does. The booking
// lands in PENDING_PAYMENT holding the slot, and the server's answer to
// `verify` is the only thing that confirms it — "prevent incorrect
// confirmation based solely on an unverified client-side payment response".
//
// The design's four payment tiles map to two real paths: UPI, card and net
// banking all go to the gateway, which collects the instrument itself (that
// choice belongs inside Razorpay's own sheet, not on this page), and Wallet
// is the HelloFit wallet balance, which settles with no gateway at all.

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { clockOf, createBooking, getAddresses, getQuote } from '@/lib/booking';
import type { Quote } from '@/lib/booking';
import { getServices } from '@/lib/catalog';
import type { ApiService } from '@/lib/catalog';
import { loadProfile } from '@/lib/profile';
import type { ApiAddress } from '@/lib/profile';
import { createOrder, getWalletBalance, openGateway, payFromWallet, verifyPayment } from '@/lib/payments';

const money = (n: number) => `₹${n.toLocaleString('en-IN')}`;

type Method = 'upi' | 'card' | 'netbanking' | 'wallet';

const METHODS: { id: Method; icon: string; title: string; sub: string }[] = [
  { id: 'upi', icon: '📱', title: 'UPI', sub: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', icon: '💳', title: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', icon: '🏦', title: 'Net Banking', sub: 'Pay through your bank' },
  { id: 'wallet', icon: '👛', title: 'HelloFit Wallet', sub: 'Pay from your balance' },
];

export function Checkout() {
  const router = useRouter();
  const params = useSearchParams();

  const serviceId = params.get('service') ?? '';
  const addressId = params.get('address') ?? '';
  const sessionDate = params.get('date') ?? '';
  const fromMinute = Number(params.get('from') ?? '0');
  const toMinute = Number(params.get('to') ?? '0');
  const goal = params.get('goal') ?? '';
  const level = params.get('level') ?? '';
  const notes = params.get('notes') ?? '';

  const [service, setService] = useState<ApiService | null>(null);
  const [address, setAddress] = useState<ApiAddress | null>(null);
  const [who, setWho] = useState({ name: '', email: '', mobile: '' });
  const [wallet, setWallet] = useState<number | null>(null);

  const [method, setMethod] = useState<Method>('upi');
  const [coupon, setCoupon] = useState('');
  const [applied, setApplied] = useState('');
  const [couponNote, setCouponNote] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);

  const [paying, setPaying] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const complete = Boolean(serviceId && addressId && sessionDate && fromMinute >= 0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const [services, addresses, profile, balance] = await Promise.all([
        getServices(),
        getAddresses(),
        loadProfile(),
        getWalletBalance(),
      ]);

      if (cancelled) return;

      if (profile.unauthorised) {
        router.replace('/login');
        return;
      }

      setService(services.find((s) => s.id === serviceId) ?? null);
      setAddress(addresses?.find((a) => a.id === addressId) ?? null);
      setWallet(balance);

      if (profile.form) {
        setWho({
          name: [profile.form.firstName, profile.form.lastName].filter(Boolean).join(' '),
          email: profile.form.email,
          mobile: profile.form.mobile,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, serviceId, addressId]);

  // The price, re-quoted whenever an applied coupon changes. The server
  // computes the discount; what this page sends is only the code.
  useEffect(() => {
    if (!serviceId) return;

    let cancelled = false;

    void (async () => {
      const result = await getQuote({ serviceId, ...(applied ? { couponCode: applied } : {}) });
      if (cancelled) return;

      if (result.quote) {
        setQuote(result.quote);
        if (applied) {
          setCouponNote(
            result.quote.coupon
              ? `${result.quote.coupon.code} applied — you save ${money(result.quote.coupon.discount)}`
              : 'That code did not apply to this booking.',
          );
        }
      } else {
        // A refused coupon must not blank the price: re-quote without it.
        setCouponNote(result.error ?? 'That code could not be applied.');
        setApplied('');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [serviceId, applied]);

  const pay = useCallback(async () => {
    if (!complete) return setStatus('Your booking details are incomplete. Start again from the booking page.');

    setPaying(true);
    setStatus('Holding your slot…');

    const created = await createBooking({
      serviceId,
      addressId,
      sessionDate,
      fromMinute,
      ...(toMinute > fromMinute ? { toMinute } : {}),
      ...(applied ? { couponCode: applied } : {}),
      preferences: { goal, level, ...(notes ? { note: notes } : {}) },
    });

    if (!created.booking) {
      setPaying(false);
      return setStatus(created.error ?? 'Could not create the booking.');
    }

    const bookingId = created.booking.id;

    // Wallet first: it settles server-side with no gateway round trip.
    if (method === 'wallet') {
      setStatus('Paying from your wallet…');
      const result = await payFromWallet(bookingId);
      setPaying(false);

      if (!result.ok) return setStatus(result.error ?? 'The wallet payment did not go through.');
      return router.push(`/booking-confirmed?booking=${bookingId}`);
    }

    setStatus('Opening secure payment…');
    const order = await createOrder(bookingId);

    if (!order.order) {
      setPaying(false);
      return setStatus(order.error ?? 'Could not start the payment.');
    }

    try {
      const response = await openGateway(order.order, who);

      if (!response) {
        setPaying(false);
        return setStatus('Payment cancelled. Your slot is held for a short while — you can try again.');
      }

      setStatus('Confirming your payment…');

      const verified = await verifyPayment({
        bookingId,
        gatewayOrderId: response.razorpay_order_id,
        gatewayPaymentId: response.razorpay_payment_id,
        signature: response.razorpay_signature,
        // Keyed on the gateway payment, so a retried verify cannot settle twice.
        idempotencyKey: `web-${response.razorpay_payment_id}`,
      });

      setPaying(false);

      if (!verified.ok) {
        return setStatus(
          verified.error ??
            'We could not confirm the payment. If money has left your account it will be reconciled — check My Bookings shortly.',
        );
      }

      router.push(`/booking-confirmed?booking=${bookingId}`);
    } catch (cause) {
      setPaying(false);
      setStatus(cause instanceof Error ? cause.message : 'The payment gateway could not be reached.');
    }
  }, [complete, serviceId, addressId, sessionDate, fromMinute, toMinute, applied, goal, level, notes, method, who, router]);

  const total = quote ? money(quote.payable) : '—';

  return (
    <div className="checkout-layout">
      <div>
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
                onClick={() => setMethod(option.id)}
              >
                <span className="pay-icon">{option.icon}</span>
                <span>
                  <strong>{option.title}</strong>
                  <small>
                    {option.id === 'wallet' && wallet !== null ? `${money(wallet)} available` : option.sub}
                  </small>
                </span>
                <span className="method-check">{method === option.id ? '●' : ''}</span>
              </button>
            ))}
          </div>
          <div className="notice">
            🔒 <strong>Your payment is handled by the gateway.</strong> Card and UPI details are entered in the
            gateway&apos;s own window — HelloFit never sees or stores them, and a payment is confirmed only after
            the server verifies it.
          </div>
        </section>

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
              <input id="email" type="email" readOnly={true} value={who.email} placeholder="Add one in your profile" />
            </div>
            <div className="field full">
              <Link href="/profile" style={{ fontSize: '10px', color: 'var(--orange)', fontWeight: 700 }}>
                Change these in your profile →
              </Link>
            </div>
          </div>
        </section>

        <div className="back-row">
          <Link className="text-btn" href="/booking">← Back to booking</Link>
          <button className="btn primary" onClick={() => void pay()} disabled={paying || !quote}>
            {paying ? 'Working…' : <>Continue to Pay · <span id="buttonAmount">{total}</span> →</>}
          </button>
        </div>
        {status && <p className="muted" style={{ marginTop: '10px' }}>{status}</p>}
      </div>

      <aside>
        <div className="order-summary">
          <div className="eyebrow">Your order</div>
          <h2>BOOKING SUMMARY</h2>
          <div style={{ padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
            <div className="order-line"><span>Session</span><strong id="summaryService">{service?.name ?? '—'}</strong></div>
            <div className="order-line"><span>Date</span><strong id="summaryDate">{sessionDate || '—'}</strong></div>
            <div className="order-line"><span>Time</span><strong id="summaryTime">{fromMinute ? clockOf(fromMinute) : '—'}</strong></div>
            <div className="order-line"><span>Location</span><strong id="summaryLocation">{address?.label ?? '—'}</strong></div>
            <div className="order-line"><span>Duration</span><strong id="summaryDuration">{service ? `${service.durationMin} minutes` : '—'}</strong></div>
          </div>
          <div className="coupon-row">
            <input id="coupon" placeholder="Promo code" value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())} />
            <button onClick={() => setApplied(coupon.trim())}>APPLY</button>
          </div>
          {couponNote && <div id="couponMessage" className="muted" style={{ marginTop: '7px' }}>{couponNote}</div>}
          <div style={{ paddingTop: '8px' }}>
            <div className="order-line"><span>Session fee</span><strong id="fee">{quote ? money(quote.grossAmount) : '—'}</strong></div>
            <div className="order-line"><span>Travel</span><strong>{quote ? money(quote.travelCharge) : '—'}</strong></div>
            <div className="order-line"><span>Taxes</span><strong>{quote ? money(quote.tax) : '—'}</strong></div>
            <div className="order-line"><span>Discount</span><strong id="discount" style={{ color: '#57805d' }}>−{quote ? money(quote.discount) : '₹0'}</strong></div>
            <div className="order-total"><span>Total payable</span><strong id="total">{total}</strong></div>
          </div>
          <button className="btn primary pay-button" onClick={() => void pay()} disabled={paying || !quote}>
            🔒 {paying ? 'Working…' : <>Continue to Pay <span id="buttonAmount2">{total}</span></>}
          </button>
          <div className="secure-note">✓ Verified server-side before your booking is confirmed</div>
          <p className="fine-print">
            By continuing, you agree to HelloFit&apos;s Terms &amp; Conditions and Cancellation Policy.
          </p>
        </div>
        <div className="checkout-card" style={{ marginTop: '15px' }}>
          <strong style={{ fontSize: '11px' }}>Need help?</strong>
          <p className="muted" style={{ margin: '5px 0 10px' }}>Our support team can help with your booking or payment questions.</p>
          <a href="mailto:support@hellofit.example" style={{ fontSize: '10px', color: 'var(--orange)', fontWeight: 700 }}>
            Contact HelloFit Support →
          </a>
        </div>
      </aside>
    </div>
  );
}
