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

export function signOut() {
  tokenStore.clear();
}
