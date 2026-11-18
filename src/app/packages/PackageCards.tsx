'use client';

// The package cards, from live data.
//
// Replaces PlanCards. Four things the plan version had are deliberately gone,
// because a package is not a subscription (client, 17 Nov 2026):
//
//   * **The Monthly / Yearly switch** — nothing recurs, so there is no second
//     billing period to switch to.
//   * **A standing rupee price on the card** — a package holds a *percent*,
//     and the money is the service's rate. The same -15% is a different
//     number on a ₹600 session and a ₹1,200 one. Since 18 Nov the page has a
//     service picker, so a card does show rupees — but only for the service
//     picked, worked by the API, and never otherwise.
//   * **"Continue with ‹plan›" and POST /plans/:id/choose** — a package is
//     not chosen in advance and stored on the customer; it is picked in the
//     booking wizard, against the service being booked.
//   * **The feature checklist** — a package has terms, not features, and the
//     terms are the four facts shown below.
//
// So the card's job is to explain the deal, and its button carries on to the
// trainer search, where the package is actually applied.

import { useRouter } from 'next/navigation';
import type { Package } from '@/lib/packages';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Signed, and the sign is the whole meaning — +20 costs more, -15 less. */
function adjustment(percent: number): string {
  if (percent === 0) return 'Standard session rate';
  if (percent < 0) return `${Math.abs(percent)}% off the session rate`;
  return `${percent}% above the session rate`;
}

function weekdays(days: number[]): string {
  if (days.length === 0) return 'Any day of the week';
  return days.map((day) => DAYS[day] ?? day).join(', ');
}

const plural = (count: number) => (count === 1 ? 'session' : 'sessions');

/** Whole rupees — a package total never lands on paise worth showing. */
const rupees = (amount: number) =>
  `₹${Math.round(amount).toLocaleString('en-IN')}`;

/** The four facts a package states. `included` only picks the ✓ or the –. */
function terms(pack: Package): { label: string; included: boolean }[] {
  return [
    {
      label: `${pack.sessionCount} paid ${plural(pack.sessionCount)}`,
      included: true,
    },
    ...(pack.freeSessionCount > 0
      ? [
          {
            label: `${pack.freeSessionCount} free ${plural(pack.freeSessionCount)} on top`,
            included: true,
          },
        ]
      : []),
    { label: `Valid for ${pack.validityDays} days`, included: true },
    {
      label: weekdays(pack.allowedWeekdays),
      included: pack.allowedWeekdays.length === 0,
    },
    {
      label: pack.fixedInstructorAllowed
        ? 'Keep the same trainer throughout'
        : 'Trainer may vary between sessions',
      included: pack.fixedInstructorAllowed,
    },
  ];
}

export function PackageCards({
  packages,
  serviceName,
}: {
  packages: Package[];
  /** Set once a service is picked — the rate the percent was applied to. */
  serviceName?: string;
}) {
  const router = useRouter();

  if (packages.length === 0) {
    return (
      <section className="plans" id="packages">
        <p className="trial-note">
          No packages are published yet. Please check back shortly.
        </p>
      </section>
    );
  }

  return (
    <section className="plans" id="packages">
      {packages.map((pack) => (
        <article className="plan" data-plan={pack.name} key={pack.id}>
          <div className="plan-head">
            <div className="plan-icon">{pack.icon ?? '◆'}</div>
          </div>

          <h3>{pack.name}</h3>

          {/* With a service picked the card leads with the money; without
              one it leads with the session count, because the rupee figure
              belongs to the service, not the package. */}
          {pack.price === null ? (
            <div className="price">
              <span className="amount">{pack.sessionCount}</span>
              <span className="period">
                {pack.sessionCount === 1 ? ' session' : ' sessions'}
              </span>
            </div>
          ) : (
            <div className="price">
              <span className="amount">{rupees(pack.price)}</span>
              <span className="period">
                {` for ${pack.sessionCount} ${plural(pack.sessionCount)}`}
              </span>
            </div>
          )}

          <div className="billing-caption">
            {pack.perSessionPrice === null
              ? adjustment(pack.percentAdjust)
              : `${rupees(pack.perSessionPrice)} per session · ${adjustment(pack.percentAdjust)}`}
          </div>

          {serviceName ? (
            <div className="billing-caption">{`Priced for ${serviceName}`}</div>
          ) : null}

          <div className="divider" />
          <div className="includes">WHAT YOU GET</div>

          {/* One string per row, never a mix of text and expressions: React
              writes a <!-- --> marker between adjacent text nodes, which
              splits "12 paid sessions" in the served HTML. */}
          <ul className="features">
            {terms(pack).map((term, i) => (
              <li key={i}>
                <span className={term.included ? 'check' : 'cross'}>
                  {term.included ? '✓' : '–'}
                </span>{' '}
                {term.label}
              </li>
            ))}
          </ul>

          <button
            className="plan-btn"
            onClick={() => router.push('/find-a-trainer')}
          >
            Find a Trainer
          </button>
        </article>
      ))}
    </section>
  );
}
