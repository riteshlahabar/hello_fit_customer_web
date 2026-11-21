'use client';

// The profile's four tabs — About, Services & Pricing, Availability, Reviews.
//
// A client component for one reason: the demo's tab strip is driven by a
// `<script>` the parse5 conversion stripped, so all four panels were visible
// in source and the buttons were dead. This is that script, as state.
//
// **The Availability tab no longer shows times.** The demo drew six day
// buttons and four time buttons — MON 02 Nov, 9:00 AM, 11:00 AM selected —
// none of them real. The slot engine needs a service, a calendar day *and a
// saved address* (`GET /app/customer/slots`), so a public profile cannot
// honestly fill that grid: a visitor has no address and no token. Client's
// call, 13 Nov 2026: delete all sixteen buttons and keep the tab, showing the
// session formats and the areas this trainer actually covers, with one link
// into the booking page where availability is real.

import { useState } from 'react';
import Link from 'next/link';
import type { ProviderProfile, ProviderReviewsPayload } from '@/lib/provider-profile';
import { ProfileReviews } from './ProfileReviews';
import { minutes, rupees, titleCase } from './bits';

type Tab = 'about' | 'services' | 'availability' | 'reviews';

const TABS: [Tab, string][] = [
  ['about', 'About'],
  ['services', 'Services & Pricing'],
  ['availability', 'Availability'],
  ['reviews', 'Reviews'],
];

export function ProfileTabs({
  provider,
  reviews,
  bookHref,
  bookBase,
}: {
  provider: ProviderProfile;
  reviews: ProviderReviewsPayload | null;
  bookHref: string;
  /**
   * Everything the booking URL needs **except** the service, so each row of
   * the service list can append its own: `${bookBase}&service=<id>`.
   *
   * **A string, not a function.** It was `serviceHref: (id) => string` for
   * half a day, and a server component cannot pass a function to a client
   * component — React throws "Functions cannot be passed directly to Client
   * Components" and the whole page 500s. `tsc`, `eslint` and `next build` all
   * stayed green, because this page is dynamic and is never rendered at build
   * time. → `state/gotchas/website.md`
   */
  bookBase: string;
}) {
  const [active, setActive] = useState<Tab>('about');

  return (
    <section className="content-card">
      <div className="tabs" role="tablist">
        {TABS.map(([tab, label]) => (
          <button
            key={tab}
            role="tab"
            aria-selected={active === tab}
            className={active === tab ? 'active' : undefined}
            data-tab={tab}
            onClick={() => setActive(tab)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="tab-panel" id="tab-about" hidden={active !== 'about'}>
        <h2>Meet your trainer</h2>
        <p>
          {provider.bio ??
            'This trainer has not written an introduction yet. Their services and session options are listed in the next tab.'}
        </p>

        {provider.specialisations.length ? (
          <>
            <h2 style={{ marginTop: '22px' }}>Specialties</h2>
            <div className="specialties">
              {provider.specialisations.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </>
        ) : null}

        {provider.languages.length ? (
          <>
            <h2 style={{ marginTop: '22px' }}>Languages</h2>
            <div className="specialties">
              {provider.languages.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div className="tab-panel" id="tab-services" hidden={active !== 'services'}>
        <h2>Services &amp; pricing</h2>
        {provider.services.length === 0 ? (
          <p>This trainer has no approved services yet.</p>
        ) : (
          <>
            <p>
              Each price is this trainer’s own for that service. Choose one to
              continue to booking.
            </p>
            <div className="service-list">
              {provider.services.map((service) => (
                <div className="service-item" key={service.offeringId}>
                  <div>
                    <h3>{service.name}</h3>
                    <p>
                      {[
                        service.level ? titleCase(service.level) : null,
                        minutes(service.durationMin),
                        service.category?.name,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    <Link
                      className="btn outline"
                      href={`${bookBase}&service=${service.id}`}
                    >
                      Choose this service
                    </Link>
                  </div>
                  <div className="service-price">
                    {rupees(service.price)}
                    <small>per session</small>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div
        className="tab-panel"
        id="tab-availability"
        hidden={active !== 'availability'}
      >
        <h2>Where and how this trainer works</h2>
        <p>
          Times are confirmed on the booking page, against your own address —
          this trainer’s session options and service areas are below.
        </p>

        <h2 style={{ marginTop: '22px' }}>Areas served</h2>
        {provider.areas.length === 0 ? (
          <p>No service areas published yet.</p>
        ) : (
          <div className="specialties">
            {provider.areas.map((area) => (
              <span key={area.id}>
                {area.name}
                {area.city ? `, ${area.city.name}` : ''}
              </span>
            ))}
          </div>
        )}

        <Link className="btn primary" href={bookHref} style={{ marginTop: '20px' }}>
          See available times ↗
        </Link>
      </div>

      <div className="tab-panel" id="tab-reviews" hidden={active !== 'reviews'}>
        <ProfileReviews payload={reviews} />
      </div>
    </section>
  );
}
