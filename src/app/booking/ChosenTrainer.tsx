'use client';

// "Your trainer" in step 1 — the visible half of `?trainer=`.
//
// Without it the preselection is invisible: the time grid quietly shows only
// one person's free times and nothing says whose, so an empty grid reads as
// "no availability anywhere" rather than "not this trainer, this day".
//
// **It now shows the photo** (client, 21 Nov 2026) and fetches the provider
// itself rather than taking a name through the URL — a name in a query string
// is a label anyone can edit, and this one sits above a price.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProvider, type ProviderProfile } from '@/lib/provider-profile';
import { TrainerPhoto } from '@/components/TrainerPhoto';

export function ChosenTrainer({
  trainerId,
  /** Where "Change trainer" goes — the list, still narrowed to this service. */
  changeHref,
}: {
  trainerId: string;
  changeHref: string;
}) {
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const found = await getProvider(trainerId);
      if (cancelled) return;

      if (found) setProvider(found);
      else setMissing(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [trainerId]);

  if (missing) {
    return (
      <p className="muted">
        That trainer is no longer taking bookings.{' '}
        <Link href={changeHref}>Choose another trainer</Link>.
      </p>
    );
  }

  if (!provider) return <p className="muted">Loading your chosen trainer…</p>;

  const rated = provider.ratingCount > 0;
  const category = provider.services[0]?.category?.name;

  return (
    <div className="chosen-trainer">
      <div className="chosen-photo">
        <TrainerPhoto name={provider.name} photoUrl={provider.photoUrl} fill sizes="92px" />
      </div>

      <div className="chosen-facts">
        <strong>{provider.name}</strong>
        <small>
          {[
            category ?? provider.specialisations[0] ?? 'Fitness professional',
            provider.experienceYears ? `${provider.experienceYears} years experience` : null,
            rated ? `★ ${provider.rating.toFixed(1)} (${provider.ratingCount})` : 'No reviews yet',
          ]
            .filter(Boolean)
            .join(' · ')}
        </small>
        <span className="chosen-links">
          <Link href={`/trainer-profile?id=${provider.id}`}>View profile</Link>
          {' · '}
          <Link href={changeHref}>Change trainer</Link>
        </span>
      </div>
    </div>
  );
}
