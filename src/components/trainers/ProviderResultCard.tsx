'use client';

// One result card on Find a Trainer — the demo's own `.trainer-card` markup,
// with live values in place of the six invented sample trainers.
//
// What the design asked for and the API does not have is handled honestly
// rather than invented:
//   * the "Profile sample" ribbon becomes "Verified" — real providers here
//     have passed KYC, which is what the badge now means;
//   * the heart saves for real as of 13 Nov 2026 — see `SaveHeart`. It spent
//     the first week raising a toast that said favourites did not exist;
//   * a provider with no photo gets the demo's placeholder, not a broken img.

import Image from 'next/image';
import Link from 'next/link';
import type { ProviderCard } from '@/lib/providers';
import { SaveHeart } from './SaveHeart';

const PLACEHOLDER = '/hellofit-logo.png';

/** "₹850" — whole rupees, the way every price on the site is written. */
const rupees = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

export function ProviderResultCard({
  provider,
  initiallySaved = false,
  onSavedChange,
}: {
  provider: ProviderCard;
  /** Already in this customer's saved list — draws the heart filled. */
  initiallySaved?: boolean;
  /** Lets the Saved Trainers page drop a card when it is un-saved. */
  onSavedChange?: (saved: boolean) => void;
}) {
  const category = provider.categories[0]?.name;
  const rating = provider.rating > 0 ? provider.rating.toFixed(1) : null;

  return (
    <article className="trainer-card">
      <div className="photo">
        <Image
          src={provider.photoUrl || PLACEHOLDER}
          alt={`${provider.name}, fitness professional`}
          fill
          sizes="(max-width:950px) 100vw, 33vw"
        />
        <span className="verified">
          <span>✓</span> Verified
        </span>
        {category ? <span className="photo-category">{category.toUpperCase()}</span> : null}
        <SaveHeart
          instructorId={provider.id}
          name={provider.name}
          initiallySaved={initiallySaved}
          onChange={onSavedChange}
        />
      </div>

      <div className="trainer-info">
        <div className="trainer-top">
          <div>
            <h3>{provider.name}</h3>
            <div className="role">
              {provider.specialisations[0] ?? category ?? 'Fitness professional'}
            </div>
          </div>
          {rating ? (
            <div className="rating">
              <span>★</span> {rating} <small>({provider.ratingCount})</small>
            </div>
          ) : (
            <div className="rating">
              <small>No reviews yet</small>
            </div>
          )}
        </div>

        <div className="trainer-location">
          ⌖{' '}
          {provider.experienceYears
            ? `${provider.experienceYears} years experience`
            : 'New on HelloFit'}
        </div>

        {provider.headline ? <p className="trainer-bio">{provider.headline}</p> : null}

        <div className="card-bottom">
          <div className="price">
            {provider.fromPrice === null ? (
              <small>Price on request</small>
            ) : (
              <>
                {rupees(provider.fromPrice)} <small>/ session</small>
              </>
            )}
          </div>
          <Link className="btn dark" href={`/trainer-profile?id=${provider.id}`}>
            View Profile ↗
          </Link>
        </div>
      </div>
    </article>
  );
}
