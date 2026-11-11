'use client';

// The customer's own profile and addresses — PDF §5.9 ("view profile details,
// update supported profile fields, manage addresses").
//
// Two shapes meet here and do not line up field for field, so the mapping is
// explicit rather than hidden in the component:
//
// - **One `name`, two inputs.** The API stores a single `name` (120 chars);
//   the design asks for first and last. Split on the last space on the way
//   out, joined on the way in. A one-word name keeps an empty last name
//   rather than being refused — plenty of people have one.
// - **`about` is `healthNotes`.** The design's "a little about you" is the
//   column the teacher reads before arriving (`schema.prisma:161`). It is the
//   only free-text field on the profile, so it is where that text belongs.
// - **City is read-only.** `Address.cityId` is a foreign key into the City
//   master and there is **no public city list endpoint** — only
//   `/admin/masters/*`, which a customer cannot call. So the city is shown
//   from what the API resolved and never sent. Flagged for the client.

import { apiGetResult, apiSend } from './api';
import { tokenStore } from './auth';

export interface ApiProfile {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'UNDISCLOSED';
  dob: string | null;
  goal: string | null;
  healthNotes: string | null;
  referralCode: string;
  isComplete: boolean;
  user: { mobile: string; email: string | null };
}

export interface ApiAddress {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  landmark: string | null;
  pincode: string;
  isDefault: boolean;
  accessNotes: string | null;
  city: { id: string; name: string } | null;
  area: { id: string; name: string } | null;
}

/** What the profile form holds. One flat object, so the page is controlled. */
export interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  dob: string;
  gender: ApiProfile['gender'];
  about: string;
  /** The default address, or blanks when there is none yet. */
  line1: string;
  city: string;
  pincode: string;
}

export interface ProfileLoad {
  form?: ProfileForm;
  /** Kept so a save can PATCH the right address rather than create a second. */
  addressId?: string | null;
  referralCode?: string;
  unauthorised?: boolean;
  error?: string;
}

/** `Aarohi Rao` → `['Aarohi', 'Rao']`; `Aarohi` → `['Aarohi', '']`. */
function splitName(name: string): [string, string] {
  const trimmed = name.trim();
  const cut = trimmed.lastIndexOf(' ');
  return cut === -1 ? [trimmed, ''] : [trimmed.slice(0, cut), trimmed.slice(cut + 1)];
}

const joinName = (first: string, last: string) => [first.trim(), last.trim()].filter(Boolean).join(' ');

/** `dob` arrives as an ISO instant on a date column — only the day is real. */
const dayOf = (iso: string | null) => (iso ? iso.slice(0, 10) : '');

export async function loadProfile(): Promise<ProfileLoad> {
  const token = tokenStore.access;
  if (!token) return { unauthorised: true };

  const [profile, addresses] = await Promise.all([
    apiGetResult<ApiProfile>('/app/customer/profile', { token }),
    apiGetResult<ApiAddress[]>('/app/customer/addresses', { token }),
  ]);

  if (!profile.ok) {
    return {
      unauthorised: profile.error.status === 401,
      error: profile.error.message,
    };
  }

  // `listAddresses` orders `isDefault` first, so the head of the list is the
  // one the booking flow would preselect.
  const home = addresses.ok ? addresses.data[0] : undefined;
  const [firstName, lastName] = splitName(profile.data.name);

  return {
    referralCode: profile.data.referralCode,
    addressId: home?.id ?? null,
    form: {
      firstName,
      lastName,
      email: profile.data.user.email ?? '',
      mobile: profile.data.user.mobile,
      dob: dayOf(profile.data.dob),
      gender: profile.data.gender,
      about: profile.data.healthNotes ?? '',
      line1: home?.line1 ?? '',
      city: home?.city?.name ?? '',
      pincode: home?.pincode ?? '',
    },
  };
}

export interface SaveOutcome {
  ok: boolean;
  message?: string;
}

/**
 * Saves the form. Two or three requests, in this order: the profile, then the
 * address. The profile goes first because it is the part the PDF calls
 * mandatory; if the address write then fails, the name is still saved and the
 * message says which half did not land.
 */
export async function saveProfile(form: ProfileForm, addressId: string | null): Promise<SaveOutcome> {
  const token = tokenStore.access;
  if (!token) return { ok: false, message: 'Please sign in again' };

  const patch: Record<string, unknown> = {
    name: joinName(form.firstName, form.lastName),
    gender: form.gender,
    healthNotes: form.about,
  };

  // Blank is not the same as unchanged: an empty date must not be sent as
  // `""`, which the ISO8601 validator rejects with a 400.
  if (form.dob) patch.dob = form.dob;
  if (form.email.trim()) patch.email = form.email.trim();

  const saved = await apiSend<ApiProfile>('/app/customer/profile', 'PATCH', patch, token);

  if (!saved.ok) return { ok: false, message: saved.error.message };

  const address = await saveAddress(form, addressId, token);
  if (!address.ok) return address;

  return { ok: true };
}

/**
 * The address half. Only `line1` and `pincode` are editable on this screen,
 * so a blank line1 means "no address yet" and nothing is written — rather
 * than creating a row the booking flow would then offer as a destination.
 */
async function saveAddress(
  form: ProfileForm,
  addressId: string | null,
  token: string,
): Promise<SaveOutcome> {
  const line1 = form.line1.trim();
  const pincode = form.pincode.trim();

  if (!line1 || !pincode) return { ok: true };

  const body = { line1, pincode };

  const result = addressId
    ? await apiSend<ApiAddress>(`/app/customer/addresses/${addressId}`, 'PATCH', body, token)
    : await apiSend<ApiAddress>('/app/customer/addresses', 'POST', { ...body, label: 'Home', isDefault: true }, token);

  return result.ok
    ? { ok: true }
    : { ok: false, message: `Profile saved, but the address did not: ${result.error.message}` };
}
