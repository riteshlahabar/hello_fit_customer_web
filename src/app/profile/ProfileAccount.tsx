'use client';

// My Profile (PDF §5.9) — the whole page, now that it is one screen.
//
// Three things changed on the client's word, 27-11-2026:
//
// 1. **The page's own five-tab sidebar is gone.** It replaced the account
//    sidebar with a different menu, so the navigation changed under you
//    depending on which row you arrived by. `AccountSidebar` is shared with
//    every other signed-in page now.
// 2. **Password & security, Preferences and Privacy & account are deleted.**
//    They were design with no API behind them; `StaticSections.tsx` held all
//    four and is deleted with them. Notifications, the fourth, moved up to
//    the sidebar as a link to `/notifications` — the one notification screen
//    that is actually wired.
// 3. **The details are read-only until Edit is pressed**, and Edit unlocks
//    them in place rather than opening a second screen.
//
// Two fields the API will not take are marked read-only in both states rather
// than silently discarding what is typed — see `ProfileFields`.

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccountSidebar } from '@/components/AccountSidebar';
import { ProfileFields } from './ProfileFields';
import { ProfilePhoto } from './ProfilePhoto';
import { loadProfile, saveProfile } from '@/lib/profile';
import type { ProfileForm } from '@/lib/profile';

const BLANK: ProfileForm = {
  firstName: '', lastName: '', email: '', mobile: '', dob: '',
  gender: 'UNDISCLOSED', about: '', line1: '', city: '', pincode: '',
};

/** `Aarohi Rao` → `AR`. Shown until there is a photo. */
function initials(first: string, last: string): string {
  return `${first.trim()[0] ?? ''}${last.trim()[0] ?? ''}`.toUpperCase() || '—';
}

export function ProfileAccount() {
  const router = useRouter();
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [loaded, setLoaded] = useState<ProfileForm | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState('Loading your details…');
  const [saved, setSaved] = useState(false);

  const toLogin = useCallback(() => router.replace('/login'), [router]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await loadProfile();
      if (cancelled) return;

      if (result.unauthorised) {
        toLogin();
        return;
      }

      if (!result.form) {
        setStatus(result.error ?? 'Could not load your details');
        return;
      }

      setForm(result.form);
      setLoaded(result.form);
      setPhotoUrl(result.photoUrl ?? null);
      setAddressId(result.addressId ?? null);
      setStatus('All changes saved');
      setSaved(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [toLogin]);

  const set = useCallback(
    <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
      setForm((current) => (current ? { ...current, [key]: value } : current));
      setSaved(false);
      setStatus('Unsaved changes');
    },
    [],
  );

  /** Back to the values the server last gave us, and out of edit mode. */
  function cancel() {
    if (loaded) setForm(loaded);
    setEditing(false);
    setStatus('All changes saved');
    setSaved(true);
  }

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
      setPhotoUrl(fresh.photoUrl ?? null);
      setAddressId(fresh.addressId ?? null);
    }

    setEditing(false);
    setStatus('All changes saved');
    setSaved(true);
  }

  const who = form ?? BLANK;
  const avatar = initials(who.firstName, who.lastName);

  return (
    <div className="layout">
      <div className="hf-account-shell">
        <AccountSidebar current="/profile" />

        <main className="main hf-account-main">
          <div className="welcome">
            <div>
              <div className="eyebrow">YOUR ACCOUNT</div>
              <h1>My Profile</h1>
              <p>Keep your details up to date and make HelloFit work for you.</p>
            </div>
            <div className="status">
              <span className={`dot${saved ? ' saved' : ''}`} id="saveDot"></span>
              <span id="saveStatus">{status}</span>
            </div>
          </div>
  
          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>Personal information</h2>
                <p>These details help your trainer and HelloFit reach you.</p>
              </div>
              {editing ? (
                <span className="tag">Editing</span>
              ) : (
                <button type="button" className="btn primary" id="editProfile"
                  disabled={!form} onClick={() => setEditing(true)}>
                  Edit
                </button>
              )}
            </div>
  
            <form id="profileForm" onSubmit={onSubmit}>
              <div className="panel-body">
                <ProfilePhoto
                  initials={avatar}
                  photoUrl={photoUrl}
                  editing={editing}
                  onChanged={setPhotoUrl}
                  onUnauthorised={toLogin}
                />
                <ProfileFields who={who} editing={editing} set={set} />
              </div>
  
              {editing && (
                <div className="actions">
                  <button type="button" className="btn" id="cancelProfile" onClick={cancel}>
                    Cancel
                  </button>
                  <button type="submit" className="btn primary" disabled={!form}>
                    Save changes
                  </button>
                </div>
              )}
            </form>
          </div>
  
          <div className="footnote">HelloFit · Move better. Feel stronger. Live well.</div>
        </main>
      </div>
    </div>
  );
}
