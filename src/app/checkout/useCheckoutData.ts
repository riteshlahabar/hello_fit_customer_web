'use client';

// What checkout reads: the chosen service and package, the address, the
// account, the wallet balance, and the price.
//
// The quote is re-asked whenever the applied coupon changes, and **the server
// computes every figure** — what this sends is the service, the package and
// the code. A refused coupon must not blank the price, so it is dropped and
// the quote re-runs without it rather than leaving the summary empty.
//
// Split out of `Checkout.tsx` under the 200-line rule.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getQuote, type Quote } from '@/lib/booking';
import { getAddresses } from '@/lib/addresses';
import { getServices, type ApiService } from '@/lib/catalog';
import { listPackages, type Package } from '@/lib/packages';
import { loadProfile, type ApiAddress } from '@/lib/profile';
import { getWalletBalance } from '@/lib/payments';

const money = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export function useCheckoutData(params: {
  serviceId: string;
  packageId: string;
  addressId: string;
  /** The coupon the customer has applied, blank for none. */
  applied: string;
  onCouponRefused: () => void;
}) {
  const router = useRouter();

  const [service, setService] = useState<ApiService | null>(null);
  const [pack, setPack] = useState<Package | null>(null);
  const [address, setAddress] = useState<ApiAddress | null>(null);
  const [who, setWho] = useState({ name: '', email: '', mobile: '' });
  const [wallet, setWallet] = useState<number | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [couponNote, setCouponNote] = useState<string | null>(null);

  const { serviceId, packageId, addressId, applied, onCouponRefused } = params;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const [services, addresses, profile, balance, packages] = await Promise.all([
        getServices(),
        getAddresses(),
        loadProfile(),
        getWalletBalance(),
        // The package names the figures: without it the summary says what the
        // customer is paying but not what they are buying.
        serviceId ? listPackages(serviceId) : Promise.resolve([]),
      ]);

      if (cancelled) return;

      if (profile.unauthorised) {
        router.replace('/login');
        return;
      }

      setService(services.find((row) => row.id === serviceId) ?? null);
      setPack(packages.find((row) => row.id === packageId) ?? null);
      setAddress(addresses?.find((row) => row.id === addressId) ?? null);
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
  }, [router, serviceId, packageId, addressId]);

  useEffect(() => {
    if (!serviceId) return;

    let cancelled = false;

    void (async () => {
      const result = await getQuote({
        serviceId,
        ...(packageId ? { packageId } : {}),
        ...(applied ? { couponCode: applied } : {}),
      });

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
        return;
      }

      setCouponNote(result.error ?? 'That code could not be applied.');
      onCouponRefused();
    })();

    return () => {
      cancelled = true;
    };
  }, [serviceId, packageId, applied, onCouponRefused]);

  return { service, pack, address, who, wallet, quote, couponNote };
}
