'use client';

// The live half of Profile & settings (PDF §5.9) — the account shell, the
// sidebar, and the personal-information form reading and writing
// `/app/customer/profile` and `/app/customer/addresses`.
//
// The demo's values were hard-coded ("Aarohi Rao", "aarohi@example.com",
// "Baner, Pune"); they come from the signed-in account now. The markup,
// classes and ids are the design's.
//
// Three inputs the design offers that the API will not take, each marked
// read-only rather than silently discarding what is typed into it:
//
// - **Mobile** — the login identity. Changing it means verifying a new
//   number by OTP, which §3.1 does not ask for.
// - **City** — `Address.cityId` is a foreign key and there is no public city
//   list to pick from (only `/admin/masters/cities`). Shown as resolved.
// - **Profile photo** — no avatar column and no upload route for customers.

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StaticSections } from './StaticSections';
import { loadProfile, saveProfile } from '@/lib/profile';
import type { ProfileForm } from '@/lib/profile';

type Section = 'profile' | 'security' | 'notifications' | 'preferences' | 'privacy';

const NAV: { id: Section; icon: string; label: string }[] = [
  { id: 'profile', icon: '♙', label: 'Personal profile' },
  { id: 'security', icon: '♢', label: 'Password & security' },
  { id: 'notifications', icon: '♧', label: 'Notifications' },
  { id: 'preferences', icon: '⚙', label: 'Preferences' },
  { id: 'privacy', icon: '▣', label: 'Privacy & account' },
];

/** `Aarohi Rao` → `AR`. The avatar shows initials; there is no photo column. */
function initials(first: string, last: string): string {
  const letters = `${first.trim()[0] ?? ''}${last.trim()[0] ?? ''}`.toUpperCase();
  return letters || '—';
}

export function ProfileAccount() {
  const router = useRouter();
  const [section, setSection] = useState<Section>('profile');
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [loaded, setLoaded] = useState<ProfileForm | null>(null);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [status, setStatus] = useState('Loading your details…');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await loadProfile();
      if (cancelled) return;

      if (result.unauthorised) {
        router.replace('/login');
        return;
      }

      if (!result.form) {
        setStatus(result.error ?? 'Could not load your details');
        return;
      }

      setForm(result.form);
      setLoaded(result.form);
      setAddressId(result.addressId ?? null);
      setStatus('All changes saved');
      setSaved(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const set = useCallback(
    <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
      setForm((current) => (current ? { ...current, [key]: value } : current));
      setSaved(false);
      setStatus('Unsaved changes');
    },
    [],
  );

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form) return;

    setStatus('Saving…');
    setSaved(false);

    const result = await saveProfile(form, addressId);

    if (!result.ok) {
      setStatus(result.message ?? 'Could not save');
      return;
    }

    // Re-read rather than trusting the local copy: the server trims the name
    // and may have created the address, which changes the id a second save
    // must patch.
    const fresh = await loadProfile();
    if (fresh.form) {
      setForm(fresh.form);
      setLoaded(fresh.form);
      setAddressId(fresh.addressId ?? null);
    }

    setStatus('All changes saved');
    setSaved(true);
  }

  const who = form ?? {
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    dob: '',
    gender: 'UNDISCLOSED' as const,
    about: '',
    line1: '',
    city: '',
    pincode: '',
  };

  const avatar = initials(who.firstName, who.lastName);
  const fullName = [who.firstName, who.lastName].filter(Boolean).join(' ') || 'Your account';

  return (
    <>
      {/* The demo's own topbar was removed here on 13 Nov: the shared Header
          in the root layout carries the brand, the menu and the avatar on
          every page now, and keeping this one gave /profile two headers.
          smoke:web-shell counts them, which is how it was caught. */}

      <div className="layout">
        <aside className="sidebar" id="sidebar">
          <div className="user-mini">
            <div className="user-pic" id="sideAvatar">{avatar}</div>
            <div><strong id="sideName">{fullName}</strong><small>Customer account</small></div>
          </div>
          <div className="nav-label">MY ACCOUNT</div>
          <Link className="nav-btn" href="/dashboard"><span className="ico">▦</span> Dashboard</Link>
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-btn${section === item.id ? ' active' : ''}`}
              data-section={item.id}
              onClick={() => setSection(item.id)}
            >
              <span className="ico">{item.icon}</span> {item.label}
            </button>
          ))}
          <div className="sidebar-bottom">
            <strong>Need a little help?</strong>
            <p>Our support team is here if you need assistance with your account.</p>
            <a className="text-link" href="mailto:support@hellofit.example">Contact support ↗</a>
          </div>
        </aside>

        <main className="main">
          <div className="welcome">
            <div>
              <div className="eyebrow">YOUR ACCOUNT</div>
              <h1>Profile &amp; settings</h1>
              <p>Keep your details up to date and make HelloFit work for you.</p>
            </div>
            <button className="mobile-menu">☰ Menu</button>
            <div className="status">
              <span className={`dot${saved ? ' saved' : ''}`} id="saveDot"></span>
              <span id="saveStatus">{status}</span>
            </div>
          </div>

          <section className={`section${section === 'profile' ? ' active' : ''}`} id="profile">
            <div className="panel">
              <div className="panel-head">
                <div><h2>Personal information</h2><p>These details help your trainer and HelloFit reach you.</p></div>
                <span className="tag">Customer profile</span>
              </div>
              <form id="profileForm" onSubmit={onSubmit}>
                <div className="panel-body">
                  <div className="profile-strip">
                    <div className="large-avatar" id="largeAvatar">{avatar}</div>
                    <div>
                      <strong>Profile photo</strong>
                      <p>Your initials are shown while profile photos are not yet supported.</p>
                    </div>
                  </div>
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
                      <input id="dob" type="date" value={who.dob} onChange={(e) => set('dob', e.target.value)} />
                    </div>
                    <div className="field">
                      <label htmlFor="gender">Gender (optional)</label>
                      <select id="gender" value={who.gender}
                        onChange={(e) => set('gender', e.target.value as ProfileForm['gender'])}>
                        <option value="UNDISCLOSED">Prefer not to say</option>
                        <option value="FEMALE">Female</option>
                        <option value="MALE">Male</option>
                        <option value="OTHER">Other</option>
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
                </div>
                <div className="actions">
                  <button type="button" className="btn" id="resetProfile"
                    onClick={() => { if (loaded) { setForm(loaded); setStatus('All changes saved'); setSaved(true); } }}>
                    Discard changes
                  </button>
                  <button type="submit" className="btn primary" disabled={!form}>Save profile changes</button>
                </div>
              </form>
            </div>
          </section>

          <StaticSections active={section} />

          <div className="footnote">HelloFit · Move better. Feel stronger. Live well.</div>
        </main>
      </div>
    </>
  );
}
