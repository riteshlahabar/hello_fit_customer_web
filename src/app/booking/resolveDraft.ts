// What the raw choices mean once the API has answered — pure, so it needs no
// effect and cannot hold a stale copy of anything.
//
// Two of these matter beyond tidiness:
//
//   * **`livePackageId` is blank unless the package is sold on the chosen
//     service.** A package carried in from a trainer profile belongs to the
//     service that profile row named, which may not be the one being booked;
//     dropping it turns a certain 404 on the quote into a visible choice in
//     step 1.
//   * **`address` falls back to the customer's first saved one.** Location is
//     step 2 as of 23 Nov 2026, so the time step always has an address to
//     query with; the fallback is what makes a returning customer's default
//     address already selected when they get there, and changing it re-runs
//     `GET /slots`.

import type { ApiService } from '@/lib/catalog';
import type { Package } from '@/lib/packages';
import type { ApiAddress } from '@/lib/profile';
import { isAnswered, type Draft, type StepNumber } from './steps';
import type { RawDraft } from './useBookingDraft';

export interface Resolved {
  service: ApiService | null;
  pack: Package | null;
  livePackageId: string;
  address: ApiAddress | null;
  addressId: string;
  draft: Draft;
  complete: boolean;
  changeTrainerHref: string;
}

export function resolveDraft(
  raw: RawDraft,
  data: { services: ApiService[] | null; packages: Package[]; addresses: ApiAddress[] },
): Resolved {
  const service = data.services?.find((row) => row.id === raw.serviceId) ?? null;
  const pack = data.packages.find((row) => row.id === raw.packageId) ?? null;
  const livePackageId = pack ? raw.packageId : '';
  const addressId = raw.addressId || data.addresses[0]?.id || '';
  const address = data.addresses.find((row) => row.id === addressId) ?? null;

  const draft: Draft = {
    serviceId: raw.serviceId,
    packageId: livePackageId,
    date: raw.date,
    hasSlot: Boolean(raw.slot),
    addressId,
  };

  return {
    service,
    pack,
    livePackageId,
    address,
    addressId,
    draft,
    // Step 4 asks nothing of its own, so the first three decide.
    complete: ([1, 2, 3] as StepNumber[]).every((n) => isAnswered(n, draft)),
    changeTrainerHref: raw.serviceId
      ? `/find-a-trainer?service=${raw.serviceId}` +
        (livePackageId ? `&package=${livePackageId}` : '')
      : '/find-a-trainer',
  };
}

/** The query string checkout is handed — every choice, nothing derived there. */
export function checkoutQuery(raw: RawDraft, resolved: Resolved): string {
  if (!resolved.service || !raw.slot) return '';

  return new URLSearchParams({
    service: resolved.service.id,
    package: resolved.livePackageId,
    address: resolved.addressId,
    date: raw.date,
    from: String(raw.slot.fromMinute),
    to: String(raw.slot.toMinute),
    ...(raw.notes.trim() ? { notes: raw.notes.trim() } : {}),
    // Checkout is what calls `POST /bookings`, so the chosen trainer has to
    // survive the hand-off: dropped here, the customer would pick a trainer,
    // see only that trainer's times, and then be assigned somebody else.
    ...(raw.trainerId ? { trainer: raw.trainerId } : {}),
  }).toString();
}
