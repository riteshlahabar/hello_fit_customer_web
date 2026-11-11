// The static half of the session page, verbatim from the client's design.
//
// This is general preparation advice — warm-up, cool-down, a readiness
// checklist, equipment, safety wording and a tip. It is copy, not data, so it
// needs no API and is rendered as supplied.
//
// Three blocks of the demo are **not** rendered, and deliberately:
//
// - **Exercise instructions** — the demo left `#exerciseList` empty for its
//   script to fill from a local array, with a "0 of 6 done" counter and a
//   progress bar. There is no exercise, set or rep anywhere in the backend
//   and "workout plan" has zero hits in the v3 PDF, so the panel would render
//   an empty list under a counter that counts nothing.
// - **Start / finish workout and the session timer** — the same: no endpoint,
//   and session completion is the provider's action in the provider app
//   (PDF §4.8), not the customer's.
// - **Message trainer** — there is no messaging in the PDF or the API.
//
// Flagged for the client: these are the website's version of the eight
// non-PDF admin screens. If workout plans are wanted, they need a backend.

export function WorkoutGuide() {
  return (
    <section className="panel">
      <div className="panel-head">
        <div><h2>Session overview</h2><div className="panel-sub">Everything you need before you begin.</div></div>
        <span className="tag orange">Preparation guide</span>
      </div>
      <div className="steps">
        <div className="step"><div className="step-num">01</div><div><h3>Warm up · 7 minutes</h3><p>Start with easy marching or light cardio, then add shoulder circles, hip hinges, and gentle bodyweight squats. Build up gradually rather than rushing into heavy sets.</p></div></div>
        <div className="step"><div className="step-num">02</div><div><h3>Main session · 35 minutes</h3><p>Follow your trainer&apos;s plan at a controlled pace. Rest between sets, keep your breathing steady, and choose a load that lets you maintain good technique.</p></div></div>
        <div className="step"><div className="step-num">03</div><div><h3>Cool down · 8 minutes</h3><p>Slow your pace, breathe calmly, and finish with comfortable stretches for the legs, chest, shoulders, and back. Avoid forcing a stretch.</p></div></div>
      </div>
    </section>
  );
}

export function ReadinessChecklist() {
  return (
    <section className="panel">
      <div className="panel-head">
        <div><h2>Before you start</h2><div className="panel-sub">A quick readiness checklist.</div></div>
        <span>✓</span>
      </div>
      <div className="checklist" id="readiness">
        <label className="checkitem"><input type="checkbox" /><span>I&apos;ve cleared enough space and checked my equipment.</span></label>
        <label className="checkitem"><input type="checkbox" /><span>I&apos;ve had some water and feel ready to move.</span></label>
        <label className="checkitem"><input type="checkbox" /><span>I&apos;ve chosen a comfortable weight and can keep good form.</span></label>
        <label className="checkitem"><input type="checkbox" /><span>I&apos;ll stop if I feel pain, dizziness, or unusual discomfort.</span></label>
      </div>
    </section>
  );
}

export function EquipmentAndSafety() {
  return (
    <>
      <section className="panel">
        <div className="panel-head">
          <div><h2>What you&apos;ll need</h2><div className="panel-sub">Simple equipment checklist.</div></div>
        </div>
        <div className="checklist" id="equipment">
          <label className="checkitem"><input type="checkbox" /><span>Pair of dumbbells or suitable alternatives</span></label>
          <label className="checkitem"><input type="checkbox" /><span>Exercise mat or non-slip surface</span></label>
          <label className="checkitem"><input type="checkbox" /><span>Water bottle and towel</span></label>
          <label className="checkitem"><input type="checkbox" /><span>Comfortable workout clothes and shoes</span></label>
        </div>
      </section>

      <div className="safety">
        <strong>Safety first</strong><br />
        These are general instructions, not personalised medical advice. Use a suitable load, prioritise
        technique, and stop if you feel pain, dizziness, or unusual symptoms. Seek qualified guidance when needed.
      </div>

      <div className="tip">
        <div className="eyebrow">HelloFit tip</div>
        <h3>Good form is your superpower.</h3>
        <p>Move with control, breathe through each rep, and choose a version of every exercise that feels appropriate for you.</p>
      </div>
    </>
  );
}
