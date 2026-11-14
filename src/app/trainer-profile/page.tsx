import Link from 'next/link';
import type { Metadata } from 'next';
import { getProvider, getProviderReviews } from '@/lib/provider-profile';
import { ProfileHero } from './ProfileHero';
import { ProfileTabs } from './ProfileTabs';
import { ProfileSide } from './ProfileSide';
import { rupees } from './bits';
import './page.css';

/**
 * Trainer Profile — PDF §5.6. The last dead end in the customer journey until
 * 13 Nov 2026 (Phase 5).
 *
 * The converted page was one invented person — "Sneha Patil", 4.9 from 120
 * sample reviews, ₹600, sample dates — and all 32 of its buttons were inert.
 * It now reads `GET /providers/:id` and `GET /instructors/:id/reviews`, both
 * public: §5.5 opens with "as a **visitor** or customer", so the profile must
 * render before anyone signs in. Only the booking that follows needs a token.
 *
 * Both entry points already passed `?id=` — Find a Trainer's "View Profile ↗"
 * and (as of today) the homepage's trainer band.
 */

export const metadata: Metadata = {
  title: 'Trainer Profile | HelloFit',
};

function NotFound({ reason }: { reason: string }) {
  return (
    <div data-hf-page="trainer-profile">
      <main>
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link> /{' '}
            <Link href="/find-a-trainer">Find a Trainer</Link> /{' '}
            <span>Trainer Profile</span>
          </div>
          <section className="content-card" style={{ marginTop: '24px' }}>
            <h2>{reason}</h2>
            <p>
              The trainer may no longer be taking bookings, or the link may be
              out of date. Browse everyone available instead.
            </p>
            <Link className="btn primary" href="/find-a-trainer">
              Find a Trainer ↗
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}

export default async function TrainerProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  if (!id) return <NotFound reason="No trainer selected" />;

  // The reviews call is fired alongside the profile rather than after it: the
  // Reviews tab is one click away, and a second round trip on that click is
  // visible. A failed reviews call is not fatal — `ProfileReviews` renders the
  // "no reviews yet" state — so only the profile decides the 404.
  const [provider, reviews] = await Promise.all([
    getProvider(id),
    getProviderReviews(id),
  ]);

  // `GET /providers/:id` answers 404 both for a provider who does not exist
  // and for one who is not public, deliberately, so this page cannot be used
  // to discover who is suspended or unapproved. One message for both.
  if (!provider) return <NotFound reason="Trainer not found" />;

  const bookHref = `/booking?trainer=${provider.id}`;
  const savedHref = `/trainer-profile?id=${provider.id}`;

  return (
    <div data-hf-page="trainer-profile">
      <main>
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link> /{' '}
            <Link href="/find-a-trainer">Find a Trainer</Link> /{' '}
            <span>{provider.name}</span>
          </div>

          <ProfileHero
            provider={provider}
            bookHref={bookHref}
            savedHref={savedHref}
          />

          <div className="main-layout">
            <div className="main-column">
              <ProfileTabs
                provider={provider}
                reviews={reviews}
                bookHref={bookHref}
              />

              {/* The design's second services band, and the target of the
                  booking card's "View Services" anchor. */}
              <section className="content-card" id="services">
                <h2>Services at a glance</h2>
                {provider.services.length === 0 ? (
                  <p>This trainer has no approved services yet.</p>
                ) : (
                  <div className="service-list">
                    {provider.services.map((service) => (
                      <div className="service-item" key={service.offeringId}>
                        <div>
                          <h3>{service.name}</h3>
                          <p>
                            {service.category?.name ?? 'Service'} ·{' '}
                            {service.durationMin} min
                          </p>
                        </div>
                        <div className="service-price">
                          {rupees(service.price)}
                          <small>per session</small>
                          <Link
                            className="btn primary"
                            href={`${bookHref}&service=${service.id}`}
                          >
                            Select
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <ProfileSide provider={provider} bookHref={bookHref} />
          </div>

          <section className="cta">
            <div>
              <h2>Ready to make your move?</h2>
              <p>Explore trainers and find a session that fits your life.</p>
            </div>
            <Link className="btn" href="/find-a-trainer">
              Explore Trainers ↗
            </Link>
          </section>
        </div>
      </main>
      <div className="toast" id="toast" role="status" aria-live="polite" />
    </div>
  );
}
