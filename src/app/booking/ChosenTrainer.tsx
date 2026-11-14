'use client';

// "You chose ‹trainer›" on the booking page — the visible half of `?trainer=`.
//
// Without it the preselection is invisible: the slot grid quietly shows only
// one person's times and nothing on the page says whose, so an empty grid
// reads as "no availability anywhere" rather than "not this trainer, this
// day". The customer can also drop the choice from here, which is the only
// way back to auto-assign once the URL carries a trainer.
//
// It fetches the name itself rather than taking it through the URL: a name in
// a query string is a label anyone can edit, and this one sits above a price.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProvider } from '@/lib/provider-profile';

export function ChosenTrainer({ trainerId }: { trainerId: string }) {
  const [name, setName] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const provider = await getProvider(trainerId);
      if (cancelled) return;

      if (provider) setName(provider.name);
      else setMissing(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [trainerId]);

  if (missing) {
    return (
      <div className="panel">
        <p className="muted">
          That trainer is no longer taking bookings.{' '}
          <Link href="/find-a-trainer">Choose another trainer</Link> or continue
          and we will assign one.
        </p>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-icon">♙</span>
        <div>
          <h2>Your trainer</h2>
          <p>
            {name
              ? `${name} — times below are theirs only.`
              : 'Loading your chosen trainer…'}
          </p>
        </div>
      </div>
      <p className="muted">
        <Link href={`/trainer-profile?id=${trainerId}`}>View profile</Link>
        {' · '}
        <Link href="/find-a-trainer">Change trainer</Link>
        {' · '}
        <Link href="/booking">Let HelloFit choose</Link>
      </p>
    </div>
  );
}
