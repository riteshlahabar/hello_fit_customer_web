'use client';

// The dashboard's profile panel — the demo's "Aditya Kulkarni /
// aditya@example.com / +91 98765 43210 / Pune" form, now live.
//
// It saves through the same `saveProfile()` the `/profile` page uses, so there
// is one write path and no second idea of what a profile is.
//
// Two fields are read-only, for the reasons already recorded on `/profile`:
// **mobile** is the login identity and the API will not take it here, and
// **city** is derived from the saved address's resolved service area
// (`UpdateCustomerProfileDto` has no `cityId` at all). Showing them as
// editable and silently dropping the edit is the one thing worse than showing
// them locked.
//
// The design's grid, labels, ids and inline styles are unchanged.

import { useEffect, useState } from 'react';
import { loadProfile, saveProfile, type ProfileForm } from '@/lib/profile';

const INPUT = {
  width: '100%',
  padding: '12px',
  border: '1px solid var(--line)',
  borderRadius: '10px',
  marginTop: '6px',
} as const;

const LOCKED = { ...INPUT, background: '#f7f4f0', color: 'var(--muted)' } as const;

/** `Aarohi Rao` → `['Aarohi','Rao']`, mirroring the lib's own split. */
function splitName(full: string): [string, string] {
  const trimmed = full.trim();
  const cut = trimmed.lastIndexOf(' ');
  return cut === -1 ? [trimmed, ''] : [trimmed.slice(0, cut), trimmed.slice(cut + 1)];
}

export function LiveProfileForm() {
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [fullName, setFullName] = useState('');
  const [addressId, setAddressId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let live = true;
    void loadProfile().then((result) => {
      if (!live) return;
      if (result.unauthorised) return setNote('Sign in to manage your profile.');
      if (!result.form) return setNote(result.error ?? 'Could not load your profile.');
      setForm(result.form);
      setFullName([result.form.firstName, result.form.lastName].filter(Boolean).join(' '));
      setAddressId(result.addressId ?? null);
    });
    return () => {
      live = false;
    };
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form) return;

    setSaving(true);
    setNote(null);

    const [firstName, lastName] = splitName(fullName);
    const outcome = await saveProfile({ ...form, firstName, lastName }, addressId);

    setSaving(false);
    setNote(outcome.ok ? 'Saved.' : outcome.message ?? 'Could not save.');
  }

  if (!form) {
    return <p className="muted">{note ?? 'Loading your details…'}</p>;
  }

  return (
    <form
      id="profileForm"
      className="profile-form"
      onSubmit={onSubmit}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '15px' }}
    >
      <div>
        <label htmlFor="fullName">Full name</label>
        <input id="fullName" required={true} style={INPUT}
          value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div>
        <label htmlFor="email">Email address</label>
        <input id="email" type="email" required={true} style={INPUT}
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div>
        <label htmlFor="phone">Mobile number</label>
        <input id="phone" readOnly={true} style={LOCKED} value={form.mobile} />
      </div>
      <div>
        <label htmlFor="city">City</label>
        <input id="city" readOnly={true} style={LOCKED}
          value={form.city} placeholder="Set from your service area" />
      </div>
      <div style={{ gridColumn: '1/-1' }}>
        <button className="primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {note && <span className="muted" style={{ marginLeft: '12px' }}>{note}</span>}
      </div>
    </form>
  );
}
