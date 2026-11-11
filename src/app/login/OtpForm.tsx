'use client';

// The demo's `#otpForm`, wired to the backend.
//
// **The markup is the demo's, unchanged** — same classes, same two-step shape
// (address field, then a hidden six-digit field that appears once a code is
// sent), same "SEND ONE-TIME CODE →" button.
//
// One field changed meaning, and only its label, placeholder and type: the
// demo asks for an email, the backend sends the code by **SMS to a mobile
// number** (`auth.service.ts`). The wording is lifted from the demo's own
// register tab, which already says "Mobile number / 10-digit mobile number",
// so nothing new was invented.
//
// The demo's note "no email will be sent" is gone because a code genuinely is
// sent now.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { normaliseMobile, OTP_LENGTH, sendOtp, verifyOtp } from '@/lib/auth';

type Stage = 'mobile' | 'code';

export function OtpForm({ onMessage }: { onMessage: (text: string, bad?: boolean) => void }) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('mobile');
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const request = async () => {
    const normalised = normaliseMobile(mobile);

    if (!normalised) {
      onMessage('Enter a valid 10-digit mobile number.', true);
      return;
    }

    setBusy(true);
    const result = await sendOtp(normalised);
    setBusy(false);

    if (!result.ok) {
      onMessage(result.message, true);
      return;
    }

    setStage('code');
    // `devCode` only comes back outside production, where there is no SMS
    // provider; showing it is what makes the flow completable in development.
    onMessage(
      result.devCode
        ? `Code sent. Development code: ${result.devCode}`
        : `We sent a ${OTP_LENGTH}-digit code to ${normalised}.`,
    );
  };

  const confirm = async () => {
    const normalised = normaliseMobile(mobile);
    if (!normalised) return;

    if (code.trim().length !== OTP_LENGTH) {
      onMessage(`Enter the ${OTP_LENGTH}-digit code.`, true);
      return;
    }

    setBusy(true);
    const result = await verifyOtp(normalised, code.trim());
    setBusy(false);

    if (!result.ok) {
      onMessage(result.message, true);
      return;
    }

    onMessage('Signed in. Taking you to your dashboard…');
    router.push('/dashboard');
  };

  return (
    <form
      id="otpForm"
      className="form-view"
      noValidate={true}
      onSubmit={(event) => {
        event.preventDefault();
        void (stage === 'mobile' ? request() : confirm());
      }}>
      <div className="field">
        <label htmlFor="otpMobile">Mobile number</label>
        <input
          id="otpMobile"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="10-digit mobile number"
          required={true}
          value={mobile}
          onChange={(event) => setMobile(event.target.value)}
        />
      </div>

      <div className="field" id="otpCodeField" hidden={stage !== 'code'}>
        <label htmlFor="otpCode">{OTP_LENGTH}-digit verification code</label>
        <input
          id="otpCode"
          inputMode="numeric"
          maxLength={OTP_LENGTH}
          placeholder={`Enter the ${OTP_LENGTH}-digit code`}
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
      </div>

      <button className="submit" type="submit" id="otpSubmit" disabled={busy}>
        {stage === 'mobile' ? 'SEND ONE-TIME CODE   →' : 'VERIFY AND SIGN IN   →'}
      </button>

      {stage === 'code' ? (
        <p className="legal">
          Didn&apos;t get it?{' '}
          <button
            type="button"
            className="text-link"
            onClick={() => void request()}
            disabled={busy}>
            Send again
          </button>
        </p>
      ) : (
        <p className="legal">
          We&apos;ll text you a {OTP_LENGTH}-digit code. Standard message rates apply.
        </p>
      )}
    </form>
  );
}
