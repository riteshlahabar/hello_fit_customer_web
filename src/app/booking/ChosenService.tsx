'use client';

// "Your service" and "Your package" in step 1 — client, 21 Nov 2026:
// "by default show the service which is selected first and give option change
// service and return to package selection."
//
// **What this replaces.** Step 1 used to render every published service as a
// grid of radio cards, each priced at `Service.basePrice`. By then the
// customer had already picked a service *and* a package on `/packages`, so
// they were asked a second time, and the figure on the card was the base
// price rather than what the package costs. Now the chosen service is stated
// once, with the way back to change it.
//
// **The package is required** (client's choice), so when none arrives in the
// URL — the customer came from a trainer profile, say — this offers the
// packages sold on that service rather than bouncing them to `/packages`.

import Link from 'next/link';
import type { ApiService } from '@/lib/catalog';
import type { Package } from '@/lib/packages';

const rupees = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

/** "12 sessions · 2 free · valid 90 days · 10% below the session rate". */
function terms(pack: Package): string {
  const adjust = Number(pack.percentAdjust);

  return [
    `${pack.sessionCount} ${pack.sessionCount === 1 ? 'session' : 'sessions'}`,
    pack.freeSessionCount > 0 ? `${pack.freeSessionCount} free` : null,
    pack.persons > 1 ? `${pack.persons} people per session` : null,
    `valid ${pack.validityDays} days`,
    adjust === 0
      ? 'at the session rate'
      : `${Math.abs(adjust)}% ${adjust < 0 ? 'below' : 'above'} the session rate`,
  ]
    .filter(Boolean)
    .join(' · ');
}

export function ChosenService({
  service,
  packages,
  packageId,
  onPackage,
}: {
  service: ApiService | null;
  /** Packages sold on this service — `GET /packages?serviceId=`. */
  packages: Package[];
  packageId: string;
  onPackage: (id: string) => void;
}) {
  if (!service) {
    return (
      <p className="muted">
        No service chosen yet. <Link href="/packages">Pick a service and a package</Link> to
        start.
      </p>
    );
  }

  const chosen = packages.find((row) => row.id === packageId);

  return (
    <>
      <div className="chosen-row">
        <div>
          <span className="chosen-label">Service</span>
          <strong>{service.name}</strong>
          <small>
            {service.category?.name ?? 'Session'} · {service.durationMin} minutes per session
          </small>
        </div>
        <Link className="text-link" href="/packages">
          Change service
        </Link>
      </div>

      <div className="chosen-row">
        <div>
          <span className="chosen-label">Package</span>
          {chosen ? (
            <>
              <strong>
                {chosen.name}
                {chosen.price !== null ? ` — ${rupees(chosen.price)}` : ''}
              </strong>
              <small>{terms(chosen)}</small>
            </>
          ) : (
            <>
              <strong>Not chosen yet</strong>
              <small>A package sets the price, the session count and the head count.</small>
            </>
          )}
        </div>
        <Link className="text-link" href={`/packages?service=${service.slug}`}>
          Change package
        </Link>
      </div>

      {packages.length === 0 ? (
        <p className="muted">
          No package is published for {service.name} yet, so it cannot be booked.{' '}
          <Link href="/packages">Choose another service</Link>.
        </p>
      ) : (
        <div className="package-options">
          {packages.map((pack) => (
            <button
              key={pack.id}
              type="button"
              className={`package-option${pack.id === packageId ? ' selected' : ''}`}
              onClick={() => onPackage(pack.id)}
            >
              <span className="radio" />
              <span className="package-name">
                {pack.icon ? `${pack.icon} ` : ''}
                {pack.name}
              </span>
              <small>{terms(pack)}</small>
              {pack.price !== null ? (
                <span className="package-price">
                  {rupees(pack.price)}
                  {pack.perSessionPrice !== null ? (
                    <small>{rupees(pack.perSessionPrice)} / session</small>
                  ) : null}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
