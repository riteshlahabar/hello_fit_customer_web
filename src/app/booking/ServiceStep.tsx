'use client';

// Step 1's body — the trainer, the service and the package.
//
// Client, 21 Nov 2026: "there is four tabs — choose service; in this, your
// trainer: we already select trainer according to service, show this trainer
// and give option change trainer. Here also choose service: by default show
// the service which is selected first, and give option change service and
// return to package selection."
//
// **The goal and the experience-level selects were removed on 23-11-2026**
// (client). They were the design's, not the PDF's, and they were the only
// thing step 1 asked that the booking did not need — `preferences` now
// carries just the note the Location step collects, which is what the trainer
// app reads on `GET /requests`.

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
}: {
  trainerId: string;
  changeTrainerHref: string;
  loading: boolean;
  service: ApiService | null;
  packages: Package[];
  packageId: string;
  onPackage: (id: string) => void;
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

    </>
  );
}
