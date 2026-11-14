// The profile's right-hand column — trainer information and the second
// "Book a Session" button.
//
// The demo's middle card here was "Sample availability": three day buttons
// and three times, all invented. Deleted with the Availability tab's grid for
// the same reason — no public route can produce a slot without a signed-in
// customer's address. The card is now the trainer's areas, which is real, and
// keeps the button the design put at the bottom of it.

import Link from 'next/link';
import { SESSION_LABELS } from '@/lib/providers';
import type { ProviderProfile } from '@/lib/provider-profile';

export function ProfileSide({
  provider,
  bookHref,
}: {
  provider: ProviderProfile;
  bookHref: string;
}) {
  const cities = [
    ...new Set(
      provider.areas
        .map((area) => area.city?.name)
        .filter((name): name is string => Boolean(name)),
    ),
  ];

  return (
    <aside className="side-column">
      <section className="side-card">
        <h3>Trainer information</h3>

        {cities.length ? (
          <div className="info-line">
            <span className="info-icon">⌖</span>
            <div>
              <strong>Based in</strong>
              <small>{cities.join(' · ')}</small>
            </div>
          </div>
        ) : null}

        {provider.experienceYears ? (
          <div className="info-line">
            <span className="info-icon">◷</span>
            <div>
              <strong>Experience</strong>
              <small>{provider.experienceYears}+ years</small>
            </div>
          </div>
        ) : null}

        {provider.sessionFormats.length ? (
          <div className="info-line">
            <span className="info-icon">⌂</span>
            <div>
              <strong>Session locations</strong>
              <small>
                {provider.sessionFormats
                  .map((format) => SESSION_LABELS[format])
                  .join(' · ')}
              </small>
            </div>
          </div>
        ) : null}

        {provider.specialisations.length ? (
          <div className="info-line">
            <span className="info-icon">✳</span>
            <div>
              <strong>Specialties</strong>
              <small>{provider.specialisations.join(' · ')}</small>
            </div>
          </div>
        ) : null}

        {provider.languages.length ? (
          <div className="info-line">
            <span className="info-icon">✦</span>
            <div>
              <strong>Languages</strong>
              <small>{provider.languages.join(' · ')}</small>
            </div>
          </div>
        ) : null}
      </section>

      <section className="side-card">
        <h3>Areas served</h3>
        {provider.areas.length === 0 ? (
          <div className="info-line">
            <span className="info-icon">⌖</span>
            <div>
              <strong>Not published yet</strong>
              <small>This trainer has no service areas listed.</small>
            </div>
          </div>
        ) : (
          provider.areas.map((area) => (
            <div className="info-line" key={area.id}>
              <span className="info-icon">⌖</span>
              <div>
                <strong>{area.name}</strong>
                <small>{area.city?.name ?? 'Service area'}</small>
              </div>
            </div>
          ))
        )}
        <Link className="btn primary full" href={bookHref}>
          Book a Session ↗
        </Link>
      </section>

      <div className="tip">
        <h3>
          Your journey,
          <br />
          your pace.
        </h3>
        <p>
          Choose a service, review the session details and continue when you’re
          ready.
        </p>
        <Link href="/find-a-trainer">← Back to all trainers</Link>
      </div>
    </aside>
  );
}
