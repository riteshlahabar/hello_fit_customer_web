// The wording on a package card, split out of `PackageCards.tsx` on
// 18 Nov 2026 so neither file passes the project's 200-line limit.
//
// All of it is copy *derived from data* — a percent read back as a sentence, a
// weekday list, the line that explains the price — so it is the half of the
// card worth reading on its own, without the JSX around it.

import type { Package } from '@/lib/packages';

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/** Signed, and the sign is the whole meaning — +20 costs more, -15 less. */
export function adjustment(percent: number): string {
  if (percent === 0) return 'Standard session rate';
  if (percent < 0) return `${Math.abs(percent)}% off the session rate`;
  return `${percent}% above the session rate`;
}

function weekdays(days: number[]): string {
  if (days.length === 0) return 'Any day of the week';
  return days.map((day) => DAYS[day] ?? day).join(', ');
}

export const plural = (count: number) =>
  count === 1 ? 'session' : 'sessions';

/** Whole rupees — a package total never lands on paise worth showing. */
export const rupees = (amount: number) =>
  `₹${Math.round(amount).toLocaleString('en-IN')}`;

/**
 * The line under the price: the service's own rate before the package touched
 * it, and the adjustment applied to it (client, 18 Nov 2026).
 *
 * **The figure here is the service's base rate, worded "per session"**
 * (client, 18 Nov 2026). The line used to lead with `perSessionPrice` — the
 * rate *after* the percent — which on a one-session package simply repeated
 * the total printed above it. That came off; the wording stayed, because
 * "₹800 per session" is what a customer reads and "base rate" is our word for
 * it, not theirs. `Package.perSessionPrice` is still returned by the API and
 * still used where the customer actually pays — it is only off this card.
 *
 * Built as parts and joined, so a missing piece drops out instead of leaving a
 * stray separator — the base rate is absent until a service is picked.
 *
 * The base rate is per *person*: a group package multiplies it by `persons`,
 * so that is said outright rather than left to be inferred from a number that
 * does not divide into the total.
 */
export function caption(pack: Package, basePrice?: number): string {
  const parts: string[] = [];

  if (basePrice !== undefined) {
    parts.push(
      pack.persons > 1
        ? `${rupees(basePrice)} per person per session`
        : `${rupees(basePrice)} per session`,
    );
  }
  parts.push(adjustment(pack.percentAdjust));

  return parts.join(' · ');
}

/** The facts a package states. `included` only picks the ✓ or the –. */
export function terms(
  pack: Package,
): { label: string; included: boolean }[] {
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
    ...(pack.persons > 1
      ? [{ label: `For ${pack.persons} people per session`, included: true }]
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
