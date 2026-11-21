'use client';

// The four tabs across the top of the booking page.
//
// The markup and the `.step` / `.step.active` / `.step.done` classes are the
// client's design, which has carried all three since the page was converted —
// `booking/page.tsx` simply hard-coded `active` on the first one and never
// rendered the other states. A step the customer cannot open yet is a
// disabled button rather than a hidden one: the strip is also the map of what
// the booking still needs.

import { canReach, isAnswered, STEPS, type Draft, type StepNumber } from './steps';

export function StepStrip({
  step,
  draft,
  onPick,
}: {
  step: StepNumber;
  draft: Draft;
  onPick: (next: StepNumber) => void;
}) {
  return (
    <div className="steps">
      {STEPS.map((entry) => {
        const n = entry.n as StepNumber;
        const done = n !== step && isAnswered(n, draft);
        const open = canReach(n, draft);

        return (
          <button
            key={n}
            type="button"
            className={`step${n === step ? ' active' : ''}${done ? ' done' : ''}`}
            aria-current={n === step ? 'step' : undefined}
            disabled={!open}
            onClick={() => onPick(n)}
          >
            <span className="step-num">{done ? '✓' : n}</span>
            <div>
              <strong>{entry.title}</strong>
              <small>{entry.hint}</small>
            </div>
          </button>
        );
      })}
    </div>
  );
}
