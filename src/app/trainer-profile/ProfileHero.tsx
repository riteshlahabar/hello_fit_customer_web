// The trainer profile's hero and its booking card — PDF §5.6.
//
// The demo's version of this block was one invented person: "Sneha Patil",
// 4.9 from "120 sample reviews", "320+ sessions", "₹600 / session" and a
// "Sample profile" ribbon. Every one of those is now the real provider's, or
// gone:
//
//   * **"320+ sessions" is deleted.** Nothing counts a provider's completed
//     sessions on any public route, and a number on a profile is a claim
//     about a real person's experience.
//   * **"Sample profile" becomes "Verified"** — only providers an
//     administrator approved (`InstructorService.approvedAt`, PDF 6.5) are
//     returned here at all, which is what the badge now means.
//   * **The rating line disappears when there are no reviews.** Showing
//     "★★★★★ 0.0 · Based on 0 reviews" to launch a new provider is worse
//     than showing nothing.
//   * **"↗ Share" is deleted.** No endpoint and no design behind it.

import Image from 'next/image';
import Link from 'next/link';
import { SaveHeart } from '@/components/trainers/SaveHeart';
import type { ProviderProfile } from '@/lib/provider-profile';
import { rupees, starRow } from './bits';

const PLACEHOLDER = '/hellofit-logo.png';

export function ProfileHero({
  provider,
  savedHref,
  bookHref,
}: {
  provider: ProviderProfile;
  /** Where the sign-in bounce returns to — this profile. */
  savedHref: string;
  bookHref: string;
}) {
  const category = provider.services[0]?.category?.name;
  const fromPrice = provider.services.length
    ? Math.min(...provider.services.map((service) => service.price))
    : null;
  const city = provider.areas[0]?.city?.name;
  const rated = provider.ratingCount > 0;

  return (
    <section className="profile-hero">
      <div className="portrait">
        <Image
          src={provider.photoUrl ?? PLACEHOLDER}
          alt={provider.name}
          width={900}
          height={1100}
          sizes="(max-width:950px) 100vw, 40vw"
        />
        <span className="verified">
          <span>✓</span> Verified
        </span>
      </div>

      <div className="profile-main">
        <div className="profile-topline">
          {category ? <span className="pill">{category.toUpperCase()}</span> : null}
          {provider.specialisations[0] ? (
            <span className="pill neutral">{provider.specialisations[0]}</span>
          ) : null}
        </div>

        <h1>{provider.name}</h1>
        <div className="subtitle">
          {[category ? `${category} trainer` : 'Trainer', city]
            .filter(Boolean)
            .join(' · ')}
        </div>

        {rated ? (
          <div className="profile-rating">
            <span className="stars">{starRow(provider.rating)}</span>
            <strong>{provider.rating.toFixed(1)}</strong>
            <small>
              Based on {provider.ratingCount} review
              {provider.ratingCount === 1 ? '' : 's'}
            </small>
          </div>
        ) : (
          <div className="profile-rating">
            <small>No reviews yet</small>
          </div>
        )}

        {provider.bio ? <p className="profile-summary">{provider.bio}</p> : null}

        <div className="quick-stats">
          {provider.experienceYears ? (
            <div>
              <strong>{provider.experienceYears}+ years</strong>
              <span>Experience</span>
            </div>
          ) : null}
          <div>
            <strong>{provider.services.length}</strong>
            <span>Service{provider.services.length === 1 ? '' : 's'}</span>
          </div>
        </div>

        <div className="profile-actions">
          <Link className="btn primary" href={bookHref}>
            Book a Session ↗
          </Link>
          <SaveHeart
            instructorId={provider.id}
            name={provider.name}
            className="btn outline"
            label="Save Trainer"
            next={savedHref}
          />
        </div>
      </div>

      <aside className="book-card" id="bookingCard">
        <div>
          <div className="price">
            {fromPrice === null ? (
              'Price on request'
            ) : (
              <>
                {rupees(fromPrice)} <small>/ session</small>
              </>
            )}
          </div>
          <p>
            {fromPrice === null
              ? 'This trainer has not published a price yet.'
              : 'Starting price. Choose a service and a time to continue.'}
          </p>
        </div>
        <Link className="btn primary" href={bookHref}>
          Check Availability ↗
        </Link>
        <a className="btn dark" href="#services">
          View Services
        </a>
      </aside>
    </section>
  );
}
