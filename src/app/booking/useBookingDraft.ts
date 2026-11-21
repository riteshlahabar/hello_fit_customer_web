'use client';

// Everything the booking wizard *decides*, as opposed to everything it reads
// (`useBookingData`). Split out so `BookingWizard` is the four panels and
// nothing else — it was past the 200-line rule with both halves in it.
//
// This hook holds **raw** choices only, and takes no data: the derived values
// (which service, which package, whether the step is answered) are computed
// by `resolveDraft` once the API has answered. Keeping the two apart is what
// avoids a cycle — the data hook needs the ids to query with, and the derived
// values need the data to resolve against.
//
// `serviceId` and `trainerId` are read-only here. Changing either is a
// navigation, not a field: the trainer comes from the list and the service
// from the package page, and both links are built with the other choices
// still attached.

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { nextDays } from '@/lib/clock';
import type { Slot } from '@/lib/slots';
import type { StepNumber } from './steps';

/** How far ahead the date strip runs. `maxAdvanceDays` is 60 server-side. */
const DAYS_AHEAD = 14;

export interface RawDraft {
  trainerId: string;
  serviceId: string;
  packageId: string;
  step: StepNumber;
  days: string[];
  date: string;
  slot: Slot | null;
  addressId: string;
  goal: string;
  level: string;
  notes: string;
  error: string | null;
}

export function useBookingDraft() {
  const params = useSearchParams();

  const trainerId = params.get('trainer') ?? '';
  const serviceId = params.get('service') ?? '';

  const [step, setStep] = useState<StepNumber>(1);
  const [packageId, setPackageId] = useState(params.get('package') ?? '');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState<Slot | null>(null);
  const [addressId, setAddressId] = useState('');
  const [goal, setGoal] = useState('Improve flexibility');
  const [level, setLevel] = useState('Beginner');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(() => nextDays(DAYS_AHEAD), []);

  // A different day or a different address is a different question, so the
  // chosen time cannot survive either.
  const chooseDate = useCallback((iso: string) => {
    setDate(iso);
    setSlot(null);
  }, []);

  const chooseAddress = useCallback((id: string) => {
    setAddressId(id);
    setSlot(null);
  }, []);

  const raw: RawDraft = {
    trainerId,
    serviceId,
    packageId,
    step,
    days,
    date: date || days[0] || '',
    slot,
    addressId,
    goal,
    level,
    notes,
    error,
  };

  return {
    raw,
    setStep,
    setPackageId,
    setSlot,
    setGoal,
    setLevel,
    setNotes,
    setError,
    chooseDate,
    chooseAddress,
  };
}
