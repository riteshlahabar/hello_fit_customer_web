// Customer authentication for the website.
//
// The backend's customer auth is **mobile + OTP** (`auth.service.ts`): send a
// code to a mobile number, verify it, get an access token and a rotating
// refresh token. There is no customer email/password login and no Google —
// the admin panel has password login, customers do not.
//
// That is why the demo's "Continue with email OTP" tab is wired and its
// "Sign in" and "Google" tabs are not: the design offers three doors and the
// API has one. PDF §3.1 asks for "login using the agreed authentication
// method" and names no other, so this is the agreed one.
//
// Tokens live in `localStorage`, which means they are per-browser and
// readable by any script on this origin. That is the same trade the admin
// panel already makes (`hf_admin_access_token`); revisit both together if the
// client wants httpOnly cookies, because it needs a backend change.

'use client';

import { apiSend } from './api';
import { setSessionRefresher } from './session-expiry';

const ACCESS_KEY = 'hf_customer_access_token';
const REFRESH_KEY = 'hf_customer_refresh_token';

/** The OTP is six digits — `otp.service.ts:8`, `OTP_LENGTH = 6`. */
export const OTP_LENGTH = 6;

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface VerifyResponse extends TokenPair {
  user?: { id: string; isNewAccount?: boolean };
}

/**
 * `localStorage` throws in a few real situations — Safari private mode, a
 * browser set to block site data — and an auth helper that throws takes the
 * whole page with it. Every access is guarded.
 */
export const tokenStore = {
  get access(): string | null {
    try {
      return localStorage.getItem(ACCESS_KEY);
    } catch {
      return null;
    }
  },

  get refresh(): string | null {
    try {
      return localStorage.getItem(REFRESH_KEY);
    } catch {
      return null;
    }
  },

  save(tokens: TokenPair) {
    try {
      localStorage.setItem(ACCESS_KEY, tokens.accessToken);
      localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    } catch {
      // Signed in for this page view only. Better than failing the login.
    }
  },

  clear() {
    try {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
    } catch {
      /* nothing to clear */
    }
  },
};

export const isSignedIn = () => Boolean(tokenStore.access);

/** Ten digits, optionally with the +91 the design's placeholder implies. */
export function normaliseMobile(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(local) ? local : null;
}

/**
 * Step one: ask for a code.
 *
 * In development the API returns `devCode` so the flow can be completed
 * without an SMS provider — it is surfaced in the UI there and nowhere else,
 * which is the same affordance the smoke tests rely on.
 */
export async function sendOtp(mobile: string) {
  const result = await apiSend<{ sent: boolean; expiresAt: string; devCode?: string }>(
    '/auth/otp/send',
    'POST',
    { mobile },
  );

  return result.ok
    ? { ok: true as const, devCode: result.data.devCode }
    : { ok: false as const, message: result.error.message };
}

/** Step two: verify the code and keep the tokens. */
export async function verifyOtp(mobile: string, code: string) {
  const result = await apiSend<VerifyResponse>('/auth/otp/verify', 'POST', {
    mobile,
    code,
  });

  if (!result.ok) return { ok: false as const, message: result.error.message };

  tokenStore.save(result.data);

  return { ok: true as const, isNewAccount: result.data.user?.isNewAccount ?? false };
}

/**
 * Swaps an expired access token for a fresh pair. Clears both on failure, so
 * a dead refresh token logs the customer out rather than looping.
 */
export async function refreshSession(): Promise<boolean> {
  const refreshToken = tokenStore.refresh;
  if (!refreshToken) return false;

  const result = await apiSend<TokenPair>('/auth/refresh', 'POST', { refreshToken });

  if (!result.ok) {
    tokenStore.clear();
    return false;
  }

  tokenStore.save(result.data);
  return true;
}

/**
 * Wire the refresh into every authenticated request.
 *
 * **This is what stops the 15-minute logout.** `refreshSession` was written
 * with the login flow and then never called by anything, so the access token
 * simply died after `JWT_ACCESS_TTL` and the signed-in pages started coming
 * back 401 — silently, because each page turned the refusal into a dash or an
 * empty panel. The refresh token is good for 30 days; nothing was spending it.
 *
 * `api.ts` now asks for a fresh token on any 401 that carried one, retries the
 * request once, and ejects to `/login?expired=1` when this returns `null` —
 * which `refreshSession` has already made the right answer by clearing both
 * tokens when the refresh itself is refused.
 *
 * Registered at module scope because every module that sends a token imports
 * `tokenStore` from this file, so in the browser this line has run before any
 * authenticated request can fail.
 */
setSessionRefresher(async () => ((await refreshSession()) ? tokenStore.access : null));

/**
 * Sign out — PDF §3.1 and §5.1, whose acceptance criteria say the customer can
 * "log out securely".
 *
 * **Clearing localStorage is not logging out.** This used to do only that, and
 * the refresh token stayed valid on the server for its full 30 days: anyone
 * holding a copy could keep minting access tokens for a session the customer
 * believed they had ended. `POST /auth/logout` revokes it, which is the part
 * that makes the word "securely" true.
 *
 * The local clear happens either way. A network failure must not leave the
 * browser holding credentials — better a revoked-server/clean-client mismatch
 * in the other direction than a signed-in browser the customer cannot leave.
 */
export async function signOut(): Promise<void> {
  const access = tokenStore.access;
  const refresh = tokenStore.refresh;

  try {
    if (access && refresh) {
      await apiSend<null>('/auth/logout', 'POST', { refreshToken: refresh }, access);
    }
  } finally {
    tokenStore.clear();
  }
}
