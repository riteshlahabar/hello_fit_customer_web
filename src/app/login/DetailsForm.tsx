'use client';

// The one-time details step, shown straight after a successful OTP when the
// account has no name yet. Client's instruction, 16 Nov 2026.
//
// **Name and email only. The address is deliberately not here** — the booking
// flow already collects one, and `POST /app/customer/addresses` needs a real
// `areaId`, which would mean a city and area picker in the middle of signing
// in. `saveProfile` writes nothing to the address table while `line1` is
// blank, so passing blanks through is the supported path, not a workaround.
//
// Markup reuses the demo's own form classes — `.field`, `.submit`, `.legal` —
// so this looks like the OTP form it replaces rather than a new design.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveProfile, splitName, type ProfileForm } from '@/lib/profile';

/** Blank everything the details step does not ask for. */
function formFrom(fullName: string, email: string, mobile: string): ProfileForm {
  const [firstName, lastName] = splitName(fullName);

  return {
    firstName,
    lastName,
    email: email.trim(),
    mobile,
    dob: '',
    gender: 'UNDISCLOSED',
    about: '',
    // Address lives at booking. Blank `line1` tells `saveProfile` to skip it.
    line1: '',
    city: '',
    pincode: '',
  };
}

export function DetailsForm({
  mobile,
  onMessage,
}: {
  mobile: string;
  onMessage: (text: string, bad?: boolean) => void;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!fullName.trim()) {
      onMessage('Please enter your name.', true);
      return;
    }
    if (!email.trim()) {
      onMessage('Please enter your email address.', true);
      return;
    }

    setBusy(true);
    // A taken email is refused by the API before anything is written —
    // `customer.service.ts` checks `emailTaken` first — so its message is the
    // one worth showing.
    const result = await saveProfile(formFrom(fullName, email, mobile), null);
    setBusy(false);

    if (!result.ok) {
      // `SaveOutcome.message` is optional and `ok` is a plain boolean, so
      // failing is not enough to prove there is text to show.
      onMessage(result.message ?? 'Could not save your details. Try again.', true);
      return;
    }

    onMessage('Account created. Taking you to your dashboard…');
    router.push('/dashboard');
  };

  return (
    <form
      id="detailsForm"
      className="form-view"
      noValidate={true}
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}>
      <div className="field">
        <label htmlFor="detailsName">Full name</label>
        <input
          id="detailsName"
          autoComplete="name"
          placeholder="Your full name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="detailsEmail">Email address</label>
        <input
          id="detailsEmail"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <button className="submit" type="submit" disabled={busy}>
        {busy ? 'SAVING…' : 'CREATE ACCOUNT   →'}
      </button>

      <p className="legal">
        Your mobile {mobile} is verified. We ask for your address later, when
        you book your first session.
      </p>
    </form>
  );
}
