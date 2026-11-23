'use client';

// The pay flow — PDF §5.8 / US-W09.
//
// The order of operations is the spec's, not the design's:
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
// **Three ways it can settle**, and the middle one is new on 21 Nov 2026:
//
//   * **Wallet** — server-side, no gateway round trip.
//   * **The development gateway** — when the server has no `RAZORPAY_*`, its
//     order carries `publicKey: 'dev_key'`, which the real Razorpay sheet
//     rejects. This page used to open it anyway, so payment could not
//     complete on any machine without credentials ("make payment not work").
//     Now the gateway name is read and the API's own settle route finishes it.
//   * **Razorpay** — unchanged, and still only confirmed by `verify`.
//
// Split out of `Checkout.tsx` under the 200-line rule.

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBooking } from '@/lib/booking';
import {
  createOrder,
  devSettle,
  openGateway,
  payFromWallet,
  verifyPayment,
} from '@/lib/payments';
import type { Method } from './PaymentMethods';

export interface PayInput {
  complete: boolean;
  serviceId: string;
  packageId: string;
  addressId: string;
  sessionDate: string;
  fromMinute: number;
  toMinute: number;
  trainerId: string;
  coupon: string;
  notes: string;
  method: Method;
  who: { name: string; email: string; mobile: string };
}

export function usePay(input: PayInput) {
  const router = useRouter();
  const [paying, setPaying] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const confirmed = useCallback(
    (bookingId: string) => router.push(`/booking-confirmed?booking=${bookingId}`),
    [router],
  );

  const pay = useCallback(async () => {
    if (!input.complete) {
      return setStatus(
        'Your booking details are incomplete. Start again from the booking page.',
      );
    }

    setPaying(true);
    setStatus('Holding your slot…');

    const created = await createBooking({
      serviceId: input.serviceId,
      addressId: input.addressId,
      sessionDate: input.sessionDate,
      fromMinute: input.fromMinute,
      ...(input.toMinute > input.fromMinute ? { toMinute: input.toMinute } : {}),
      ...(input.packageId ? { packageId: input.packageId } : {}),
      ...(input.trainerId ? { instructorId: input.trainerId } : {}),
      ...(input.coupon ? { couponCode: input.coupon } : {}),
      ...(input.notes
        ? { preferences: { note: input.notes } }
        : {}),
    });

    if (!created.booking) {
      setPaying(false);
      return setStatus(created.error ?? 'Could not create the booking.');
    }

    const bookingId = created.booking.id;

    if (input.method === 'wallet') {
      setStatus('Paying from your wallet…');
      const result = await payFromWallet(bookingId);
      setPaying(false);

      if (!result.ok) {
        return setStatus(result.error ?? 'The wallet payment did not go through.');
      }
      return confirmed(bookingId);
    }

    setStatus('Opening secure payment…');
    const order = await createOrder(bookingId);

    if (!order.order) {
      setPaying(false);
      return setStatus(order.error ?? 'Could not start the payment.');
    }

    if (order.order.gateway === 'MANUAL') {
      setStatus('Confirming your booking (development gateway)…');
      const settled = await devSettle(bookingId);
      setPaying(false);

      if (!settled.ok) {
        return setStatus(settled.error ?? 'The development payment did not go through.');
      }
      return confirmed(bookingId);
    }

    try {
      const response = await openGateway(order.order, input.who);

      if (!response) {
        setPaying(false);
        return setStatus(
          'Payment cancelled. Your slot is held for a short while — you can try again.',
        );
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

      confirmed(bookingId);
    } catch (cause) {
      setPaying(false);
      setStatus(
        cause instanceof Error ? cause.message : 'The payment gateway could not be reached.',
      );
    }
  }, [input, confirmed]);

  return { pay, paying, status };
}
