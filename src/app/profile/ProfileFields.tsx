'use client';

// The personal-information fields, in whichever of the two states the page is
// in: read-only text, or the design's inputs.
//
// One component for both rather than two blocks of near-identical markup —
// the labels, the order and the grid are the same either way, and the client
// asked for Edit to unlock the fields *in place* (27-11-2026), which only
// reads as "in place" if nothing moves when it is pressed.
//
// Two fields are never editable, in either state, and are marked as such
// rather than silently discarded:
//
// - **Mobile** — the login identity. Changing it means verifying a new number
//   by OTP, which §3.1 does not ask for.
// - **City** — `Address.cityId` is a foreign key and there is no public city
//   list to pick from (only `/admin/masters/cities`).

import { ddMmYyyy } from '@/lib/clock';
import type { ProfileForm } from '@/lib/profile';

const GENDERS: { value: ProfileForm['gender']; label: string }[] = [
  { value: 'UNDISCLOSED', label: 'Prefer not to say' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'MALE', label: 'Male' },
  { value: 'OTHER', label: 'Other' },
];

interface Props {
  who: ProfileForm;
  editing: boolean;
  set: <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => void;
}

/**
 * A read-only row. `—` rather than an empty box, so the row keeps its height.
 *
 * No `htmlFor` and no `id`: there is no control here to point at. An earlier
 * version reused the input's id on the `<p>`, which is invalid — a `<label>`
 * cannot label a paragraph — and it also made "is this page editable?"
 * unanswerable from the HTML, which `smoke:web-account-menus` has to ask.
 */
function Value({ label, text, hint, full }: { label: string; text: string; hint?: string; full?: boolean }) {
  return (
    <div className={full ? 'field full' : 'field'}>
      <label>{label}</label>
      <p className="value">{text || '—'}</p>
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

export function ProfileFields({ who, editing, set }: Props) {
  const genderLabel = GENDERS.find((g) => g.value === who.gender)?.label ?? '';

  if (!editing) {
    return (
      <div className="grid">
        <Value label="First name" text={who.firstName} />
        <Value label="Last name" text={who.lastName} />
        <Value label="Email address" text={who.email}
          hint="Used for booking confirmations and invoices." />
        <Value label="Mobile number" text={who.mobile}
          hint="This is your sign-in number." />
        {/* Rule 4: a date a person reads is dd-mm-yyyy. */}
        <Value label="Date of birth" text={ddMmYyyy(who.dob)} />
        <Value label="Gender" text={genderLabel} />
        <Value label="Address" text={who.line1} full={true}
          hint="Where your sessions take place." />
        <Value label="City" text={who.city} />
        <Value label="PIN code" text={who.pincode} />
        <Value label="A little about you" text={who.about} full={true}
          hint="Shared with the trainer before your session." />
      </div>
    );
  }

  return (
    <div className="grid">
      <div className="field">
        <label htmlFor="firstName">First name *</label>
        <input id="firstName" required={true} autoComplete="given-name"
          value={who.firstName} onChange={(e) => set('firstName', e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="lastName">Last name</label>
        <input id="lastName" autoComplete="family-name"
          value={who.lastName} onChange={(e) => set('lastName', e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="email">Email address</label>
        <input id="email" type="email" autoComplete="email"
          value={who.email} onChange={(e) => set('email', e.target.value)} />
        <span className="hint">Used for booking confirmations and invoices.</span>
      </div>
      <div className="field">
        <label htmlFor="phone">Mobile number</label>
        <input id="phone" type="tel" readOnly={true} value={who.mobile} />
        <span className="hint">This is your sign-in number.</span>
      </div>
      <div className="field">
        <label htmlFor="dob">Date of birth</label>
        {/* `type="date"` needs yyyy-mm-dd and shows the browser's own order;
            the read-only view above is where rule 4 applies. */}
        <input id="dob" type="date" value={who.dob} onChange={(e) => set('dob', e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="gender">Gender (optional)</label>
        <select id="gender" value={who.gender}
          onChange={(e) => set('gender', e.target.value as ProfileForm['gender'])}>
          {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
      </div>
      <div className="field full">
        <label htmlFor="address">Address</label>
        <input id="address" autoComplete="street-address"
          value={who.line1} onChange={(e) => set('line1', e.target.value)} />
        <span className="hint">Where your sessions take place.</span>
      </div>
      <div className="field">
        <label htmlFor="city">City</label>
        <input id="city" readOnly={true} value={who.city} placeholder="Set from your service area" />
      </div>
      <div className="field">
        <label htmlFor="pin">PIN code</label>
        <input id="pin" inputMode="numeric" maxLength={6} autoComplete="postal-code"
          value={who.pincode} onChange={(e) => set('pincode', e.target.value)} />
      </div>
      <div className="field full">
        <label htmlFor="about">A little about you (optional)</label>
        <textarea id="about" placeholder="Anything your trainer should know — injuries, conditions or preferences…"
          value={who.about} onChange={(e) => set('about', e.target.value)}></textarea>
        <span className="hint">Shared with the trainer before your session.</span>
      </div>
    </div>
  );
}
