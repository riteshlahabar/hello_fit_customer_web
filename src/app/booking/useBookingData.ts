'use client';

// Everything the booking wizard reads from the API, in one hook, so the
// wizard itself is tabs and choices rather than five effects.
//
// Four reads, each re-run only when its own inputs move:
//
//   * **once** — services, saved addresses and the profile. The profile also
//     decides whether the customer is signed in at all.
//   * **per service** — the packages sold on it (`GET /packages?serviceId=`).
//     Global packages are not offered: a package with no service row is sold
//     nowhere, and one sold on another service is refused by the API.
//   * **per service + day + address + trainer** — the start times.
//   * **per service + package** — the price. Tagged with the query it answers
//     so a stale figure can never sit under a new package.

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getServices, type ApiService } from '@/lib/catalog';
import { listPackages, type Package } from '@/lib/packages';
import { getAddresses } from '@/lib/addresses';
import { getSlots, type Slot } from '@/lib/slots';
import { getQuote, type Quote } from '@/lib/booking';
import { loadProfile, type ApiAddress } from '@/lib/profile';

/** Shared so the memo above has a stable identity when there is no service. */
const EMPTY_PACKAGES: Package[] = [];

export interface Who {
  name: string;
  email: string;
  mobile: string;
}

export function useBookingData(params: {
  serviceId: string;
  packageId: string;
  date: string;
  /**
   * The address the customer picked, if any. Blank falls back to their first
   * saved one **inside this hook**, which is what breaks the cycle: the slot
   * query needs an address, and the address list is one of the things this
   * hook fetches.
   */
  preferredAddressId: string;
  trainerId: string;
}) {
  const router = useRouter();

  const [services, setServices] = useState<ApiService[] | null>(null);
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [who, setWho] = useState<Who>({ name: '', email: '', mobile: '' });
  const [packs, setPacks] = useState<{ key: string; rows: Package[] } | null>(null);
  const [grid, setGrid] = useState<{ key: string; slots: Slot[]; note: string | null } | null>(null);
  const [quote, setQuote] = useState<{ key: string; value: Quote | null } | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const [live, saved, profile] = await Promise.all([
        getServices(),
        getAddresses(),
        loadProfile(),
      ]);

      if (cancelled) return;

      if (profile.unauthorised) {
        router.replace('/login');
        return;
      }

      setServices(live);
      setAddresses(saved ?? []);

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
  }, [router]);

  useEffect(() => {
    if (!params.serviceId) return;

    let cancelled = false;

    void (async () => {
      const rows = await listPackages(params.serviceId);
      if (!cancelled) setPacks({ key: params.serviceId, rows });
    })();

    return () => {
      cancelled = true;
    };
  }, [params.serviceId]);

  // Tagged with the service it answers, like the grid and the quote below: no
  // service means no packages without an effect having to write that, and a
  // changed service cannot briefly show the previous one's packages.
  const packages = useMemo(
    () => (packs?.key === params.serviceId ? packs.rows : EMPTY_PACKAGES),
    [packs, params.serviceId],
  );

  const addressId = params.preferredAddressId || addresses[0]?.id || '';

  const slotKey = `${params.serviceId}|${params.date}|${addressId}|${params.trainerId}`;
  const canQuerySlots = Boolean(params.serviceId && params.date && addressId);

  useEffect(() => {
    if (!canQuerySlots) return;

    let cancelled = false;

    void (async () => {
      const result = await getSlots(
        params.serviceId,
        params.date,
        addressId,
        params.trainerId || undefined,
      );

      if (!cancelled) {
        setGrid({ key: slotKey, slots: result.slots, note: result.error ?? result.message ?? null });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params.serviceId, params.date, addressId, params.trainerId, canQuerySlots, slotKey]);

  const quoteKey = `${params.serviceId}|${params.packageId}`;

  useEffect(() => {
    if (!params.serviceId) return;

    let cancelled = false;

    void (async () => {
      const result = await getQuote({
        serviceId: params.serviceId,
        ...(params.packageId ? { packageId: params.packageId } : {}),
      });

      if (!cancelled) setQuote({ key: quoteKey, value: result.quote ?? null });
    })();

    return () => {
      cancelled = true;
    };
  }, [params.serviceId, params.packageId, quoteKey]);

  // Only the answer to the question being asked counts — comparing the tag
  // with the current key is what makes "loading" derived rather than a second
  // piece of state an effect has to reset on its way in.
  const showing = grid?.key === slotKey ? grid : null;

  return useMemo(
    () => ({
      services,
      addresses,
      setAddresses,
      who,
      packages,
      slots: showing?.slots ?? [],
      slotsNote: showing?.note ?? null,
      slotsLoading: canQuerySlots && showing === null,
      canQuerySlots,
      quote: quote?.key === quoteKey ? quote.value : null,
    }),
    [services, addresses, who, packages, showing, canQuerySlots, quote, quoteKey],
  );
}
