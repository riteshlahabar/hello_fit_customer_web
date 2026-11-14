// Small shared pieces for the trainer profile — PDF §5.6.
//
// `rupees` here rounds to whole rupees, which is how every *price* on the site
// is written (`₹850 / session`). `lib/billing.ts` exports a `rupees` of its
// own that keeps two decimals, because an invoice line is money already
// charged and `₹1,062.50` must not be shown as `₹1,063`. Two formats because
// there are genuinely two jobs, not by accident.

/** "₹850" — a price, whole rupees. */
export const rupees = (value: number) =>
  `₹${Math.round(value).toLocaleString('en-IN')}`;

/**
 * The design draws five glyphs. Filled by the rounded rating, so a provider
 * at 3.6 shows four and one at 0 shows none — the demo's hard-coded five
 * stars under "4.9" is what this replaces.
 */
export const starRow = (rating: number) => {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return '★'.repeat(filled) + '☆'.repeat(5 - filled);
};

/** `45` → `45 min`, the duration wording the service rows use. */
export const minutes = (value: number) => `${value} min`;

/**
 * `BEGINNER` → `Beginner`. `InstructorService.level` is an enum and the
 * design writes levels in sentence case.
 */
export const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase().replace(/_/g, ' ');
