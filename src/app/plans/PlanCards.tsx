'use client';

// The three plan cards and the Monthly / Yearly switch, from live data.
//
// The demo drew Starter, Plus and Premium into the HTML and wired the switch
// with an inline script that the conversion never brought across — so the
// toggle did nothing and the prices could only be changed by editing the page.
// Both are administered now (Marketing → Plans).
//
// **"Continue with ‹plan›", on every card.** The demo said "Continue with
// Starter" on the first and "Choose Plus" / "Choose Premium" on the others;
// the client asked for one wording, 13 Nov 2026.
//
// What the button does, in order:
//   not signed in  → /login, with ?next= back to here
//   signed in      → POST /plans/:id/choose, then on to Find a Trainer
//
// A plan is chosen *before* booking, not instead of it — which is why the
// journey ends at the trainer search and not at a receipt. **Nothing is
// charged**: there is no subscription behind this by design.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiSend } from '@/lib/api';
import { tokenStore } from '@/lib/auth';
import type { Plan } from '@/lib/plans';
import { useToast } from '@/components/Toast';

const rupees = (value: number) => Math.round(value).toLocaleString('en-IN');

export function PlanCards({ plans }: { plans: Plan[] }) {
  const [yearly, setYearly] = useState(false);
  const [busy, setBusy] = useState('');
  const router = useRouter();
  const showToast = useToast();

  async function choose(plan: Plan) {
    const token = tokenStore.access;

    if (!token) {
      router.push(`/login?next=${encodeURIComponent('/plans')}`);
      return;
    }

    setBusy(plan.id);
    const result = await apiSend(`/plans/${plan.id}/choose`, 'POST', {}, token);
    setBusy('');

    if (!result.ok) {
      showToast(result.error.message || 'Could not set your plan. Please try again.');
      return;
    }

    showToast(`You are on the ${plan.name} plan. Now find your trainer.`);
    router.push('/find-a-trainer');
  }

  if (plans.length === 0) {
    return (
      <section className="plans" id="plans">
        <p className="trial-note">
          No plans are published yet. Please check back shortly.
        </p>
      </section>
    );
  }

  return (
    <>
      <div className="billing-switch">
        <span className={yearly ? 'label' : 'label active'}>Monthly</span>
        <button
          className={yearly ? 'switch on' : 'switch'}
          aria-label="Switch billing period"
          aria-pressed={yearly}
          onClick={() => setYearly((v) => !v)}
        />
        <span className={yearly ? 'label active' : 'label'}>Yearly</span>
        <span className="save">SAVE UP TO 20%</span>
      </div>

      <section className="plans" id="plans">
        {plans.map((plan) => (
          <article
            className={plan.isPopular ? 'plan featured' : 'plan'}
            data-plan={plan.name}
            key={plan.id}
          >
            {plan.isPopular ? <div className="popular">MOST POPULAR</div> : null}

            <div className="plan-head">
              <div className="plan-icon">{plan.icon ?? '◆'}</div>
              {plan.eyebrow ? (
                <span className="eyebrow" style={{ letterSpacing: '1px' }}>
                  {plan.eyebrow}
                </span>
              ) : null}
            </div>

            <h3>{plan.name}</h3>
            {plan.description ? <div className="plan-desc">{plan.description}</div> : null}

            <div className="price">
              <span className="currency">₹</span>
              <span className="amount">
                {rupees(yearly ? plan.priceYearly : plan.priceMonthly)}
              </span>
              <span className="period">/ month</span>
            </div>

            {plan.billingCaption ? (
              <div className="billing-caption">{plan.billingCaption}</div>
            ) : null}

            <div className="divider" />
            <div className="includes">WHAT&apos;S INCLUDED</div>

            <ul className="features">
              {plan.features.map((feature, i) => (
                <li key={i}>
                  <span className={feature.included ? 'check' : 'cross'}>
                    {feature.included ? '✓' : '–'}
                  </span>{' '}
                  {feature.label}
                </li>
              ))}
            </ul>

            <button
              className="plan-btn"
              disabled={busy === plan.id}
              onClick={() => void choose(plan)}
            >
              {busy === plan.id ? 'Just a moment…' : `Continue with ${plan.name}`}
            </button>
          </article>
        ))}
      </section>
    </>
  );
}
