'use client';

// One result card on Find a Trainer — the demo's own `.trainer-card` markup,
// with live values in place of the six invented sample trainers.
//
// What the design asked for and the API does not have is handled honestly
// rather than invented:
//   * the "Profile sample" ribbon becomes "Verified" — real providers here
//     have passed KYC, which is what the badge now means;
//   * the heart saves for real as of 13 Nov 2026 — see `SaveHeart`.
//
// **Two changes on 21 Nov 2026, both from the client.**
//
// 1. **The photo.** It was `src={photoUrl || '/hellofit-logo.png'}` straight
//    into `next/image`, which fails twice over: the API's link is an absolute
//    `http://…` URL that `next.config.ts` refuses (https hosts only), and the
//    fallback is the company logo, so a provider with a photo and one without
//    looked identical — a grid of six logos. `TrainerPhoto` resolves the URL
//    same-origin and draws initials when there is genuinely no photo.
// 2. **The action.** Arriving from a package card the service and package are
//    already decided, so the primary button selects this trainer and goes
//    straight to the booking wizard carrying all three. "View profile" stays
//    as the secondary link rather than being dropped — the profile is where
//    the reviews and the full service list are.

import Link from 'next/link';
import type { ProviderCard } from '@/lib/providers';
import { TrainerPhoto } from '@/components/TrainerPhoto';
import { SaveHeart } from './SaveHeart';

/** The service and package the visitor is already booking, if any. */
export interface BookingContextProps {
  serviceId: string;
  serviceName: string;
  packageId?: string;
}

export function ProviderResultCard({
  provider,
  initiallySaved = false,
  onSavedChange,
  booking,
}: {
  provider: ProviderCard;
  /** Already in this customer's saved list — draws the heart filled. */
  initiallySaved?: boolean;
  /** Lets the Saved Trainers page drop a card when it is un-saved. */
  onSavedChange?: (saved: boolean) => void;
  booking?: BookingContextProps;
}) {
  const category = provider.categories[0]?.name;
  const rating = provider.rating > 0 ? provider.rating.toFixed(1) : null;

  const profileHref = booking
    ? `/trainer-profile?id=${provider.id}&service=${booking.serviceId}` +
      (booking.packageId ? `&package=${booking.packageId}` : '')
    : `/trainer-profile?id=${provider.id}`;

  const bookHref = booking
    ? `/booking?trainer=${provider.id}&service=${booking.serviceId}` +
      (booking.packageId ? `&package=${booking.packageId}` : '')
    : null;

  return (
    <article className="trainer-card">
      <div className="photo">
        <TrainerPhoto
          name={provider.name}
          photoUrl={provider.photoUrl}
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

        {/* **No price on the card** (client, 23-11-2026): "Select trainer"
            takes the price slot and "View profile" stays where it was. Admin
            sets every price, and the figure the customer acts on is the
            booking quote — a "from ₹x" here is a second number that can
            disagree with it. */}
        <div className="card-bottom">
          {bookHref ? (
            <>
              <Link className="btn dark" href={bookHref}>
                Select trainer ↗
              </Link>
              <Link className="text-link" href={profileHref}>
                View profile
              </Link>
            </>
          ) : (
            <Link className="btn dark" href={profileHref}>
              View Profile ↗
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
