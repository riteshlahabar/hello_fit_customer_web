'use client';

// A page that is nothing without a session.
//
// `api.ts` catches the common case — a token that has expired, which comes
// back 401 and either renews itself or ejects. This covers the case that never
// reaches the API at all: **no token in storage**, where every `lib/` reader
// short-circuits to `{ unauthorised: true }` without sending a request. The
// dashboard turned that into a dash in each tile and "Sign in to see your
// sessions" in the bookings panel, which left a logged-out visitor looking at
// the signed-in shell of someone else's account page.
//
// Renders nothing. The page's own markup is the client's design and stays
// exactly as converted; this only decides whether the customer should be
// looking at it.
//
// Why not a server-side check: the token lives in `localStorage`, which is the
// trade `auth.ts` documents. The server cannot read it, so the shell renders
// and the redirect happens on mount — the same one-frame flash every other
// account page already has. Moving it server-side needs httpOnly cookies and a
// backend change, noted in `auth.ts`.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isSignedIn } from '@/lib/auth';

export function RequireSignIn() {
  const router = useRouter();

  useEffect(() => {
    // Navigation, not a `setState` — nothing here renders, so there is no
    // state to set and `react-hooks/set-state-in-effect` has nothing to catch.
    if (!isSignedIn()) router.replace('/login');
  }, [router]);

  return null;
}
