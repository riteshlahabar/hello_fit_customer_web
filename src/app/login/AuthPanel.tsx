'use client';

// The demo's `section.auth-wrap`, reduced to the one door that exists.
//
// **OTP is the only way in** (client, 16 Nov 2026). Verifying a code on an
// unknown mobile *is* registration — `auth.service.ts:136` creates the user with
// the CUSTOMER role right there — so a separate "Create account" was a second
// name for the same door. The client's call was to drop it rather than build a
// registration flow behind it.
//
// Removed on that instruction: the Create account tab, Continue with Google,
// "Use email and password instead", and the "New to HelloFit? Create an
// account" footer line.
//
// **Two more went because the removals left them meaningless**, and both are
// one line to restore if that was wrong:
//
//  - the `.social` row. Its other button, "Continue with OTP", only switched to
//    the tab the page now always shows, so it did nothing — and alone in a
//    two-column grid it rendered half-width.
//  - the `.divider`. It read "OR SIGN IN WITH A PASSWORD", and there is no
//    longer a password to sign in with.
//
// With one door left there is no tab state, so the heading and subtitle are
// plain text rather than branches. `StaticForms.tsx` is now unrendered and kept
// on disk, not deleted, the same way `Language.tsx` was parked.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadProfile } from '@/lib/profile';
import { DetailsForm } from './DetailsForm';
import { OtpForm } from './OtpForm';

export function AuthPanel() {
  const router = useRouter();
  const [message, setMessage] = useState<{ text: string; bad: boolean } | null>(
    null,
  );
  const [needsDetails, setNeedsDetails] = useState<string | null>(null);

  const show = (text: string, bad = false) => setMessage({ text, bad });

  /**
   * Where a verified code lands: the dashboard, or the details step first.
   *
   * **The test is an empty name, not the API's `isNewAccount` flag.** That flag
   * is true only on the very first verify, so someone who verified once and
   * closed the tab would be `isNewAccount: false` for ever after and would slip
   * past with a blank profile. An empty name catches both.
   *
   * A profile that fails to load is not a reason to trap someone on the login
   * page, so anything unexpected falls through to the dashboard.
   */
  const afterVerify = async (mobile: string) => {
    show('Verified. Checking your account…');

    const profile = await loadProfile();
    const named = Boolean(
      profile.form && (profile.form.firstName || profile.form.lastName),
    );

    if (profile.form && !named) {
      show('Almost there — tell us who you are.');
      setNeedsDetails(mobile);
      return;
    }

    show('Signed in. Taking you to your dashboard…');
    router.push('/dashboard');
  };

  return (
    <section className="auth-wrap">
      <div className="auth-head">
        <div className="eyebrow">WELCOME TO HELLOFIT</div>
        <h2 id="authTitle">
          {needsDetails ? 'Create your account.' : 'Good to see you again.'}
        </h2>
        <p id="authSubtitle">
          {needsDetails
            ? 'Your mobile is verified. Just your name and email and you are in.'
            : 'Sign in to manage your sessions and keep your progress moving.'}
        </p>
      </div>

      {/* `.message` is `display:none` until it also carries `show`
          (page.css:59) — the demo's script added that class and the
          conversion dropped it, so every message rendered invisibly. */}
      <div
        id="message"
        className={
          message ? `message show ${message.bad ? 'error' : 'success'}` : 'message'
        }
        role="status"
        aria-live="polite">
        {message?.text ?? ''}
      </div>

      {needsDetails ? (
        <DetailsForm mobile={needsDetails} onMessage={show} />
      ) : (
        <OtpForm onMessage={show} onVerified={(mobile) => void afterVerify(mobile)} />
      )}
    </section>
  );
}
