import type { Metadata } from 'next';
import Link from 'next/link';
import { PackageCards } from './PackageCards';
import { ServicePicker } from './ServicePicker';
import { getServices } from '@/lib/catalog';
import { listPackages } from '@/lib/packages';
import './page.css';

/**
 * Converted from the demo's hellofit-membership-plans-subscription.html.
 * The markup and styling are the client's design; only the mechanics are React.
 *
 * It was the Plans page until 17 Nov 2026, when membership plans were deleted
 * and the client's word "plan" became "package". Three blocks of the demo
 * went with them rather than being reworded, because each one stated
 * something that is no longer true and nobody has supplied a replacement:
 *
 *   * the **Starter / Plus / Premium comparison table** — hard-coded tiers
 *     that no longer exist, and a package has terms, not feature tiers;
 *   * the **membership FAQs** — every answer was about subscriptions,
 *     upgrades, yearly billing and cancellation, none of which exist;
 *   * the **plan-selection modal and toast** — a package is picked in the
 *     booking wizard against a service, not chosen here in advance.
 *
 * Writing fresh copy for those would be inventing content the client has not
 * supplied, so the page stops at what is true. → state/pricing-rules.md
 */

export const metadata: Metadata = {
  title: 'Packages | HelloFit',
};

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service: slug } = await searchParams;

  // revalidate 0: a service added in the panel must be pickable at once.
  const services = await getServices(undefined, 0);
  const picked = slug ? services.find((row) => row.slug === slug) : undefined;

  // Server-rendered so the cards are never briefly empty. No service picked
  // means no cards at all (client, 18 Nov 2026), so there is nothing to
  // fetch either.
  const packages = picked ? await listPackages(picked.id) : [];

  return (
    <div data-hf-page="packages">
      <main className="container">
        <div className="crumb">
          Home / Customer Area / <b>Session Packages</b>
        </div>

        <section className="hero">
          <div>
            <div className="eyebrow">Book more, pay less per session</div>
            <h1>
              YOUR FITNESS.
              <br />
              YOUR TERMS.
            </h1>
            <p>
              A package bundles several sessions at an adjusted rate. Pick the
              one that suits your routine, then choose your trainer and service
              — the package is applied at checkout, against that service&apos;s
              rate.
            </p>
          </div>
          <div className="hero-bubble">🏆</div>
        </section>

        <section className="center">
          <h2>Find your fit</h2>
          <p>Flexible options for every stage of your fitness journey.</p>
        </section>

        <ServicePicker services={services} selected={picked?.slug} />

        {picked ? (
          <PackageCards
            packages={packages}
            serviceId={picked.id}
            serviceName={picked.name}
            // The rate the percent was applied to, stated on the card
            // (client, 18 Nov 2026). `basePrice` arrives as a decimal string.
            serviceBasePrice={Number(picked.basePrice)}
          />
        ) : (
          // Client, 18 Nov 2026: cards stay hidden until a service is picked.
          <p className="pick-first">
            Choose a service above — packages and pricing appear once you do.
          </p>
        )}

        <section className="section-title">
          <h2>More than a package</h2>
          <p>Helpful tools and perks to support your everyday routine.</p>
        </section>

        <section className="benefits">
          <div className="benefit">
            <div className="ico">🧑‍🏫</div>
            <h3>Find your coach</h3>
            <p>
              Explore trainer profiles, specialities and reviews to find your
              best match.
            </p>
          </div>
          <div className="benefit">
            <div className="ico">📆</div>
            <h3>Flexible scheduling</h3>
            <p>
              View upcoming sessions and manage your bookings from one
              dashboard.
            </p>
          </div>
          <div className="benefit">
            <div className="ico">🎯</div>
            <h3>Stay goal-focused</h3>
            <p>Keep your goals visible and build a routine that works for you.</p>
          </div>
          <div className="benefit">
            <div className="ico">💬</div>
            <h3>Help when you need it</h3>
            <p>Get support with booking-related questions and issues.</p>
          </div>
        </section>

        <section className="bottom-cta">
          <div>
            <h2>Ready to make your next move?</h2>
            <p>Explore trainers and find a session that fits your goals.</p>
          </div>
          <Link className="primary" href="/find-a-trainer">
            Find a Trainer →
          </Link>
        </section>
      </main>
    </div>
  );
}
