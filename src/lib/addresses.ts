'use client';

// The customer's session addresses, and the pincode that gives one a service
// area.
//
// **Why an address needs an area.** `findSlots` answers an address whose
// `areaId` is null with an empty grid — it matches teachers by the areas they
// serve, and an area-less address matches nobody. The profile screen has been
// creating exactly those: `POST /addresses` with `line1` and `pincode` only.
// Twenty of the twenty-nine addresses in the development database have no
// area, and every one of them shows "no times available" for ever, whatever
// the trainer's availability.
//
// **The resolution is the server's.** `GET /serviceability/:pincode` maps a
// PIN to the areas it falls in, publicly and before login, and
// `POST /addresses` resolves it again itself: sending no `areaId` is the
// normal case, a PIN that straddles two areas comes back 400 `AREA_AMBIGUOUS`
// with the candidates to choose from, and an unserved PIN still saves with no
// area so the customer keeps the address.

import { apiGet, apiGetResult, apiSend } from './api';
import { tokenStore } from './auth';
import type { ApiAddress } from './profile';

const auth = () => tokenStore.access;

/** One area a PIN resolved to. */
export interface ApiArea {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
  state: string;
}

export interface Serviceability {
  pincode: string;
  serviceable: boolean;
  areas: ApiArea[];
}

export async function getAddresses(): Promise<ApiAddress[] | null> {
  const token = auth();
  if (!token) return null;

  const result = await apiGetResult<ApiAddress[]>('/app/customer/addresses', { token });
  return result.ok ? result.data : null;
}

/** Public, and deliberately callable before the customer has signed in. */
export async function resolvePincode(pincode: string): Promise<Serviceability | null> {
  if (!/^[1-9][0-9]{5}$/.test(pincode)) return null;

  return await apiGet<Serviceability>(`/serviceability/${pincode}`, { revalidate: 0 });
}

export interface NewAddress {
  label: string;
  line1: string;
  line2?: string;
  landmark?: string;
  pincode: string;
  /** Only when the PIN straddles areas and the customer picked one. */
  areaId?: string;
}

export interface AddressOutcome {
  address?: ApiAddress;
  error?: string;
  /** Candidates when the PIN covers more than one area — the customer picks. */
  choices?: ApiArea[];
}

/**
 * Saves a new address. `areaId` is left to the server unless the customer has
 * already chosen between candidates; an ambiguous PIN comes back as `choices`
 * rather than an error the form can only repeat.
 */
export async function createAddress(input: NewAddress): Promise<AddressOutcome> {
  const token = auth();
  if (!token) return { error: 'Please sign in again' };

  const result = await apiSend<ApiAddress>(
    '/app/customer/addresses',
    'POST',
    {
      label: input.label.trim(),
      line1: input.line1.trim(),
      ...(input.line2?.trim() ? { line2: input.line2.trim() } : {}),
      ...(input.landmark?.trim() ? { landmark: input.landmark.trim() } : {}),
      pincode: input.pincode.trim(),
      ...(input.areaId ? { areaId: input.areaId } : {}),
    },
    token,
  );

  if (result.ok) return { address: result.data };

  if (result.error.code === 'AREA_AMBIGUOUS') {
    const details = result.error.details;
    if (Array.isArray(details) && details.length > 0) {
      return { choices: details as ApiArea[], error: result.error.message };
    }
  }

  return { error: result.error.message };
}
