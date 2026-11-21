'use client';

// The live booking workflow (PDF §5.7), reworked on 21 Nov 2026.
//
// **The four steps are now real tabs.** They were a decorative strip with
// `step active` hard-coded on the first one while all four panels rendered
// stacked down the page — which is what the client reported as the
// date-and-time screen appearing inside the choose-service tab. One panel
// shows at a time, a step opens only once the ones before it are answered,
// and the strip marks what is done.
//
// **The service and the package arrive decided.** `/packages` → trainer list
// → here, carrying `?service=` and `?package=`, so step 1 states them with
// the way back to change either rather than asking for a service a second
// time. The package is what prices the booking: it rides on the quote and on
// `POST /bookings`, which is the whole of "do not show the base price".
//
// **The customer picks a start, not a range** — the end is the service's own
// length. See `WhenPanel`.
//
// Three files behind this one: `useBookingDraft` holds the raw choices,
// `useBookingData` does the reading, `resolveDraft` turns the two into what
// the panels render. This file is the panels.

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { ApiAddress } from '@/lib/profile';
import { ServiceStep } from './ServiceStep';
import { WhenPanel } from './WhenPanel';
import { WherePanel } from './WherePanel';
import { ReviewPanel } from './ReviewPanel';
import { SummaryCard } from './SummaryCard';
import { StepStrip } from './StepStrip';
import { useBookingData } from './useBookingData';
import { useBookingDraft } from './useBookingDraft';
import { checkoutQuery, resolveDraft } from './resolveDraft';
import { blockedReason, canReach, type StepNumber } from './steps';

const ICONS: Record<StepNumber, string> = { 1: '✳', 2: '▦', 3: '⌖', 4: '✓' };

const HEADS: Record<StepNumber, { title: string; blurb: string }> = {
  1: { title: '01. Your trainer & service', blurb: 'Who you chose, and what you are booking.' },
  2: { title: '02. Pick a date & start time', blurb: 'The session ends after the service length.' },
  3: { title: '03. Choose session location', blurb: 'Where your trainer should come.' },
  4: { title: '04. Review your booking', blurb: 'Double-check before moving to payment.' },
};

export function BookingWizard() {
  const router = useRouter();
  const draft = useBookingDraft();
  const { raw } = draft;

  const data = useBookingData({
    serviceId: raw.serviceId,
    packageId: raw.packageId,
    date: raw.date,
    preferredAddressId: raw.addressId,
    trainerId: raw.trainerId,
  });

  const resolved = resolveDraft(raw, data);

  const go = useCallback(
    (next: StepNumber) => {
      if (!canReach(next, resolved.draft)) return draft.setError(blockedReason(resolved.draft));
      draft.setError(null);
      draft.setStep(next);
    },
    [draft, resolved.draft],
  );

  const toCheckout = useCallback(() => {
    const query = checkoutQuery(raw, resolved);
    if (!resolved.complete || !query) return draft.setError(blockedReason(resolved.draft));
    router.push(`/checkout?${query}`);
  }, [raw, resolved, draft, router]);

  const onAdded = useCallback(
    (saved: ApiAddress) => {
      data.setAddresses((current) => [...current, saved]);
      draft.chooseAddress(saved.id);
    },
    [data, draft],
  );

  return (
    <>
      <StepStrip step={raw.step} draft={resolved.draft} onPick={go} />

      <div className="layout">
        <div className="booking-main">
          <section className="panel">
            <div className="panel-head">
              <span className="panel-icon">{ICONS[raw.step]}</span>
              <div>
                <h2>{HEADS[raw.step].title}</h2>
                <p>{HEADS[raw.step].blurb}</p>
              </div>
            </div>

            {raw.step === 1 ? (
              <ServiceStep
                trainerId={raw.trainerId}
                changeTrainerHref={resolved.changeTrainerHref}
                loading={data.services === null}
                service={resolved.service}
                packages={data.packages}
                packageId={resolved.livePackageId}
                onPackage={draft.setPackageId}
                goal={raw.goal}
                onGoal={draft.setGoal}
                level={raw.level}
                onLevel={draft.setLevel}
              />
            ) : null}

            {raw.step === 2 ? (
              <WhenPanel
                days={raw.days}
                date={raw.date}
                onDate={draft.chooseDate}
                slots={data.slots}
                slot={raw.slot}
                onSlot={draft.setSlot}
                loading={data.slotsLoading}
                note={data.slotsNote}
                allowedWeekdays={resolved.pack?.allowedWeekdays ?? []}
                needsAddress={!resolved.addressId}
                onGoToLocation={() => draft.setStep(3)}
              />
            ) : null}

            {raw.step === 3 ? (
              <WherePanel
                addresses={data.addresses}
                addressId={resolved.addressId}
                onAddress={draft.chooseAddress}
                onAdded={onAdded}
                notes={raw.notes}
                onNotes={draft.setNotes}
              />
            ) : null}

            {raw.step === 4 ? (
              <ReviewPanel
                who={data.who}
                service={resolved.service}
                pack={resolved.pack}
                date={raw.date}
                slot={raw.slot}
                address={resolved.address}
                goal={raw.goal}
                level={raw.level}
              />
            ) : null}
          </section>

          <div className="bottom-actions">
            <button
              className="back-link"
              onClick={() =>
                raw.step === 1 ? router.push('/packages') : go((raw.step - 1) as StepNumber)
              }
            >
              ← {raw.step === 1 ? 'Back to packages' : 'Back'}
            </button>

            {raw.step < 4 ? (
              <button className="btn primary" onClick={() => go((raw.step + 1) as StepNumber)}>
                Next ↗
              </button>
            ) : (
              <button
                className="btn primary"
                disabled={!resolved.complete}
                onClick={toCheckout}
              >
                Continue to Payment ↗
              </button>
            )}
          </div>

          {raw.error ? <p className="step-error">{raw.error}</p> : null}
        </div>

        <SummaryCard
          service={resolved.service}
          pack={resolved.pack}
          date={raw.date}
          slot={raw.slot}
          address={resolved.address}
          quote={data.quote}
          ready={resolved.complete}
          onContinue={toCheckout}
        />
      </div>
    </>
  );
}
