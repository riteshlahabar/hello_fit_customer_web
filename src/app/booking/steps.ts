// The four steps of the booking page, and when each one is answered.
//
// **They were never steps.** `booking/page.tsx` hard-coded `class="step
// active"` on the first one and `BookingWizard` rendered all four panels
// stacked down the page, so the strip was decoration: the client read it as
// tabs and reported the date-and-time screen appearing under "Choose
// service". The design's stylesheet has carried `.step.active` and
// `.step.done` all along — the wiring is all that was missing.
//
// **The order is the client's** (23 Nov 2026): trainer and service, then
// location, then date and time, then review. It was time-then-location until
// now, which is what hid the start times: `GET /slots` cannot answer without
// an address — the institute window, the travel buffer and the daily cap are
// all computed against where the trainer has to travel to — so a customer
// with no saved address reached step 2 and saw an empty grid. Asking where
// first means the time step always has a real question to ask.

export const STEPS = [
  { n: 1, title: 'Choose service', hint: 'Trainer, service & package' },
  { n: 2, title: 'Location', hint: 'Where to meet' },
  { n: 3, title: 'Date & time', hint: 'Your schedule' },
  { n: 4, title: 'Review', hint: 'Confirm details' },
] as const;

export type StepNumber = 1 | 2 | 3 | 4;

export interface Draft {
  serviceId: string;
  packageId: string;
  date: string;
  hasSlot: boolean;
  addressId: string;
}

/**
 * Whether a step has everything it asks for. A step is reachable once every
 * step before it is answered — so the strip cannot be used to skip the
 * package and arrive at payment with a price the customer never saw.
 */
export function isAnswered(step: StepNumber, draft: Draft): boolean {
  switch (step) {
    case 1:
      // The package is required (client, 21 Nov 2026): it carries the session
      // count and the head count, and it is the only discount there is.
      return Boolean(draft.serviceId && draft.packageId);
    case 2:
      return Boolean(draft.addressId);
    case 3:
      return Boolean(draft.date && draft.hasSlot);
    case 4:
      return true;
  }
}

export function canReach(step: StepNumber, draft: Draft): boolean {
  for (let earlier = 1; earlier < step; earlier += 1) {
    if (!isAnswered(earlier as StepNumber, draft)) return false;
  }
  return true;
}

/** What to tell someone who clicked a step they cannot open yet. */
export function blockedReason(draft: Draft): string {
  if (!draft.serviceId) return 'Choose a service first.';
  if (!draft.packageId) return 'Choose a package first — it sets the price.';
  if (!draft.addressId) return 'Choose a session address first — the times depend on it.';
  if (!draft.date || !draft.hasSlot) return 'Pick a date and a start time first.';
  return '';
}
