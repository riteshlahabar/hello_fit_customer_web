'use client';

// Upload and removal of the customer's own profile photo.
//
// Its own module, and its own `fetch`, for one reason: `lib/api.ts` sends JSON
// — it sets `Content-Type: application/json` whenever there is a body and runs
// it through `JSON.stringify`. A multipart upload must do neither: the browser
// has to set the boundary itself, so the header is left off deliberately.
// Folding a second content type into `request()` would push that file past 200
// lines to serve the one route that needs it.
//
// What is lost by not going through `request()` is the automatic refresh on an
// expired session, so a 401 here is returned as `unauthorised` and the page
// sends the customer to /login — the same place `recoverSession` would have.
//
// Client instruction, 27-11-2026: My Profile can change the photo.
// Backend: `POST`/`DELETE /app/customer/profile/photo`.

import { BASE_URL } from './api-base-url';
import { tokenStore } from './auth';

const PHOTO_PATH = '/app/customer/profile/photo';

/** Mirrors the API's own allow-list, so a bad pick is caught before upload. */
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;

/** What the file input should offer. Same three types, as extensions. */
export const PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp';

export interface PhotoOutcome {
  ok: boolean;
  /** The new URL, or null when the photo was removed. */
  photoUrl?: string | null;
  unauthorised?: boolean;
  message?: string;
}

/**
 * Checked here as well as on the server so the customer hears about a 12 MB
 * holiday photo before it is uploaded over a phone connection, not after.
 */
export function describePhotoProblem(file: File): string | null {
  if (!PHOTO_TYPES.includes(file.type)) {
    return 'Choose a JPG, PNG or WebP image';
  }

  if (file.size > PHOTO_MAX_BYTES) {
    return `That image is ${(file.size / (1024 * 1024)).toFixed(1)} MB — the limit is 5 MB`;
  }

  return null;
}

async function send(method: 'POST' | 'DELETE', body?: FormData): Promise<PhotoOutcome> {
  const token = tokenStore.access;
  if (!token) return { ok: false, unauthorised: true };

  try {
    const response = await fetch(`${BASE_URL}${PHOTO_PATH}`, {
      method,
      // No Content-Type: the browser adds it with the multipart boundary.
      headers: { Authorization: `Bearer ${token}` },
      ...(body ? { body } : {}),
      cache: 'no-store',
    });

    const envelope = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        ok: false,
        unauthorised: response.status === 401,
        message: envelope?.error?.message ?? 'Could not update your photo',
      };
    }

    return { ok: true, photoUrl: envelope?.data?.photoUrl ?? null };
  } catch {
    return { ok: false, message: 'Could not reach the server' };
  }
}

export async function uploadProfilePhoto(file: File): Promise<PhotoOutcome> {
  const problem = describePhotoProblem(file);
  if (problem) return { ok: false, message: problem };

  const form = new FormData();
  form.append('file', file, file.name);
  return send('POST', form);
}

export const removeProfilePhoto = () => send('DELETE');
