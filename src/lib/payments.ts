'use client';

// Checkout and payment — PDF §5.8 / US-W09.
//
// The one rule that shapes this file is the spec's own: "prevent incorrect
// confirmation based solely on an unverified client-side payment response".
// So nothing here treats the gateway's browser callback as proof. The flow is
//
//   createOrder  →  gateway collects the money  →  verifyPayment
//
// and only the server's answer to the third step confirms the booking. The
// server re-checks the signature *and* re-fetches the payment from the
// gateway, and the gateway's own webhook settles it again independently — so
// a browser that closes mid-payment still ends up with the right status.

import { apiGetResult, apiSend } from './api';
import { tokenStore } from './auth';

export interface GatewayOrder {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  publicKey: string;
  /** 'RAZORPAY', or 'MANUAL' on a machine with no gateway credentials. */
  gateway: string;
}

const auth = () => tokenStore.access;

export async function createOrder(bookingId: string): Promise<{ order?: GatewayOrder; error?: string }> {
  const token = auth();
  if (!token) return { error: 'Please sign in again' };

  const result = await apiSend<GatewayOrder>('/app/customer/payments/order', 'POST', { bookingId }, token);
  return result.ok ? { order: result.data } : { error: result.error.message };
}

export interface VerifyInput {
  bookingId: string;
  gatewayOrderId: string;
  gatewayPaymentId: string;
  signature: string;
  idempotencyKey: string;
}

export async function verifyPayment(input: VerifyInput): Promise<{ ok: boolean; error?: string }> {
  const token = auth();
  if (!token) return { ok: false, error: 'Please sign in again' };

  const result = await apiSend('/app/customer/payments/verify', 'POST', input, token);
  return result.ok ? { ok: true } : { ok: false, error: result.error.message };
}

/**
 * Settles the booking through the API's development gateway.
 *
 * **Why this exists.** With no `RAZORPAY_*` configured the server issues an
 * order with `publicKey: 'dev_key'` and `gateway: 'MANUAL'`, and this page
 * handed it to the real `checkout.razorpay.com` regardless — so payment could
 * not complete on any machine without credentials (client, 21 Nov 2026). The
 * signing stays on the server: `ManualGateway` accepts only a signature over
 * a development secret, and a secret shipped into the client bundle is not a
 * secret. The route 403s as soon as a real gateway is configured.
 */
export async function devSettle(bookingId: string): Promise<{ ok: boolean; error?: string }> {
  const token = auth();
  if (!token) return { ok: false, error: 'Please sign in again' };

  const result = await apiSend('/app/customer/payments/dev-settle', 'POST', { bookingId }, token);
  return result.ok ? { ok: true } : { ok: false, error: result.error.message };
}

/** Pay the whole booking from the HelloFit wallet — no gateway involved. */
export async function payFromWallet(bookingId: string): Promise<{ ok: boolean; error?: string }> {
  const token = auth();
  if (!token) return { ok: false, error: 'Please sign in again' };

  const result = await apiSend('/app/customer/payments/wallet', 'POST', { bookingId }, token);
  return result.ok ? { ok: true } : { ok: false, error: result.error.message };
}

export async function getWalletBalance(): Promise<number | null> {
  const token = auth();
  if (!token) return null;

  const result = await apiGetResult<{ balance: number; currency: string }>('/app/customer/wallet', { token });
  return result.ok ? Number(result.data.balance) : null;
}

// --------------------------------------------------------------- gateway

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const CHECKOUT_JS = 'https://checkout.razorpay.com/v1/checkout.js';

/** Loads Razorpay's checkout script once, on demand. */
function loadRazorpay(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_JS}"]`);

    if (existing) {
      existing.addEventListener('load', () => resolve(Boolean(window.Razorpay)));
      existing.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = CHECKOUT_JS;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Opens the gateway and resolves with what it reported. The caller must still
 * send that to `verifyPayment` — this function proves nothing on its own.
 *
 * A dismissed checkout resolves `null` rather than rejecting: the customer
 * closing the window is an ordinary outcome, not an error.
 */
export async function openGateway(
  order: GatewayOrder,
  who: { name: string; email: string; mobile: string },
): Promise<RazorpayResponse | null> {
  const ready = await loadRazorpay();
  if (!ready || !window.Razorpay) throw new Error('Could not load the payment gateway');

  return new Promise((resolve) => {
    const checkout = new window.Razorpay!({
      key: order.publicKey,
      amount: Math.round(order.amount * 100),
      currency: order.currency,
      name: 'HelloFit',
      description: 'Fitness session booking',
      order_id: order.orderId,
      prefill: { name: who.name, email: who.email, contact: who.mobile },
      theme: { color: '#E33E29' },
      handler: (response: RazorpayResponse) => resolve(response),
      modal: { ondismiss: () => resolve(null) },
    });

    checkout.open();
  });
}
