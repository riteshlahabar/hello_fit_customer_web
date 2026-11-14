'use client';

// The heart on a trainer card — the design's control, finally wired.
//
// It drew `♡` and raised a toast saying favourites were not available, from
// the day the design arrived until 13 Nov 2026. It now writes to
// `/favourites`.
//
// **Optimistic, but it puts itself back.** The heart fills on the tap, before
// the request answers, because a quarter-second of nothing feels broken on a
// phone. If the call fails the fill is reverted and the toast says so — a
// heart that stays filled over a save that did not happen is the one outcome
// worth more than the latency.
//
// Signed out, it sends the visitor to log in rather than silently doing
// nothing. Saving needs an account and there is nowhere else to put that.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toggleSaved } from '@/lib/favourites';
import { tokenStore } from '@/lib/auth';
import { useToast } from '../Toast';

export function SaveHeart({
  instructorId,
  name,
  initiallySaved = false,
  onChange,
  className = 'heart',
  label,
  next = '/find-a-trainer',
}: {
  instructorId: string;
  name: string;
  initiallySaved?: boolean;
  /** Lets a list drop the card when it is un-saved. */
  onChange?: (saved: boolean) => void;
  /**
   * The design draws this control twice: a bare heart on the result card
   * (`.heart`) and a labelled button on the trainer profile (`.btn outline`).
   * Same behaviour, two skins — one component rather than two, so a fix to
   * the optimistic revert below cannot land on only one of them.
   */
  className?: string;
  /** Text beside the heart. Omitted on the card, which is icon-only. */
  label?: string;
  /** Where to return after signing in, when the visitor is signed out. */
  next?: string;
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const showToast = useToast();

  async function toggle() {
    if (!tokenStore.access) {
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    const wanted = !saved;
    setSaved(wanted);
    setBusy(true);

    const result = await toggleSaved(instructorId, saved);
    setBusy(false);

    if (result === null) {
      setSaved(!wanted);
      showToast('Could not update your saved trainers. Please try again.');
      return;
    }

    showToast(wanted ? `${name} saved` : `${name} removed from saved`);
    onChange?.(wanted);
  }

  return (
    <button
      className={className}
      aria-label={saved ? `Remove ${name} from saved trainers` : `Save ${name}`}
      aria-pressed={saved}
      disabled={busy}
      style={{ color: saved ? '#E33E29' : undefined }}
      onClick={() => void toggle()}
    >
      {saved ? '♥' : '♡'}
      {label ? ` ${label}` : null}
    </button>
  );
}
