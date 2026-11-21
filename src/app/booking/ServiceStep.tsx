'use client';

// Step 1's body — the trainer, the service, the package, and the two
// questions the design collects about the session itself.
//
// Client, 21 Nov 2026: "there is four tabs — choose service; in this, your
// trainer: we already select trainer according to service, show this trainer
// and give option change trainer. Here also choose service: by default show
// the service which is selected first, and give option change service and
// return to package selection."
//
// The goal and the level stay where the design draws them and travel with
// the booking in its `preferences` column — the trainer app reads the goal
// and the notes on `GET /requests`.

import { ChosenTrainer } from './ChosenTrainer';
import { ChosenService } from './ChosenService';
import type { ApiService } from '@/lib/catalog';
import type { Package } from '@/lib/packages';

export function ServiceStep({
  trainerId,
  changeTrainerHref,
  loading,
  service,
  packages,
  packageId,
  onPackage,
  goal,
  onGoal,
  level,
  onLevel,
}: {
  trainerId: string;
  changeTrainerHref: string;
  loading: boolean;
  service: ApiService | null;
  packages: Package[];
  packageId: string;
  onPackage: (id: string) => void;
  goal: string;
  onGoal: (value: string) => void;
  level: string;
  onLevel: (value: string) => void;
}) {
  return (
    <>
      {trainerId ? (
        <ChosenTrainer trainerId={trainerId} changeHref={changeTrainerHref} />
      ) : (
        <p className="muted">
          No trainer chosen — HelloFit will assign one after payment.
        </p>
      )}

      {loading ? (
        <p className="muted">Loading your service…</p>
      ) : (
        <ChosenService
          service={service}
          packages={packages}
          packageId={packageId}
          onPackage={onPackage}
        />
      )}

      <div className="field-grid" style={{ marginTop: '17px' }}>
        <div className="field">
          <label htmlFor="goal">What is your main goal?</label>
          <select id="goal" value={goal} onChange={(e) => onGoal(e.target.value)}>
            <option>Improve flexibility</option>
            <option>Build strength</option>
            <option>Reduce stress</option>
            <option>Beginner routine</option>
            <option>General fitness</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="level">Your experience level</label>
          <select id="level" value={level} onChange={(e) => onLevel(e.target.value)}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
      </div>
    </>
  );
}
