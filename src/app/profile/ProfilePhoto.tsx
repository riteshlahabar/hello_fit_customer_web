'use client';

// The profile photo strip — the design's `.profile-strip`, now able to change
// the photo (client, 27-11-2026).
//
// The design shipped `.large-avatar img { object-fit: cover }` with no way to
// ever put an `<img>` in it; this is that missing half, against the new
// `POST`/`DELETE /app/customer/profile/photo`.
//
// One honest difference from the rest of the page, said out loud in the copy:
// the fields wait for Save, the photo does not. It is its own route and its
// own request, so it is applied the moment a file is chosen. Pretending
// otherwise would mean holding bytes in memory until Save and leaving the
// customer unsure whether the picture they can see is stored.

import { useRef, useState } from 'react';
import { PHOTO_ACCEPT, removeProfilePhoto, uploadProfilePhoto } from '@/lib/profile-photo';

interface Props {
  initials: string;
  photoUrl: string | null;
  editing: boolean;
  /** Handed back to the page, which owns the URL the avatar is drawn from. */
  onChanged: (photoUrl: string | null) => void;
  onUnauthorised: () => void;
}

export function ProfilePhoto({ initials, photoUrl, editing, onChanged, onUnauthorised }: Props) {
  const picker = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function run(work: () => Promise<{ ok: boolean; photoUrl?: string | null; unauthorised?: boolean; message?: string }>) {
    setBusy(true);
    setProblem(null);

    const result = await work();

    if (result.unauthorised) {
      onUnauthorised();
      return;
    }

    if (!result.ok) {
      setProblem(result.message ?? 'Could not update your photo');
      setBusy(false);
      return;
    }

    onChanged(result.photoUrl ?? null);
    setBusy(false);
  }

  async function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Cleared before the upload so picking the same file twice still fires a
    // change event — a browser will not re-fire it for an unchanged value.
    event.target.value = '';
    if (file) await run(() => uploadProfilePhoto(file));
  }

  return (
    <div className="profile-strip">
      <div className="large-avatar" id="largeAvatar">
        {photoUrl ? <img src={photoUrl} alt="Your profile photo" /> : initials}
      </div>
      <div>
        <strong>Profile photo</strong>
        <p>
          {problem
            ? problem
            : photoUrl
              ? 'JPG, PNG or WebP, up to 5 MB. A photo is saved as soon as you choose it.'
              : 'Your initials are shown until you add a photo. JPG, PNG or WebP, up to 5 MB.'}
        </p>

        {editing && (
          <div className="photo-actions">
            <input
              ref={picker}
              type="file"
              accept={PHOTO_ACCEPT}
              onChange={onPick}
              hidden={true}
              aria-hidden={true}
              tabIndex={-1}
            />
            <button type="button" className="btn" disabled={busy} onClick={() => picker.current?.click()}>
              {busy ? 'Working…' : photoUrl ? 'Change photo' : 'Add photo'}
            </button>
            {photoUrl && (
              <button
                type="button"
                className="btn"
                disabled={busy}
                onClick={() => void run(removeProfilePhoto)}
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
