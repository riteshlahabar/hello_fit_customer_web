'use client';

// "Your current membership" and "Membership summary", read from the plan the
// customer actually chose (`GET /plans/mine`).
//
// **Four things the demo drew are deliberately gone**, because the client's
// 13 Nov decision is that there is no recurring payment:
//
//   * Next billing date, and the whole "Upcoming renewal" card — nothing
//     renews, so a date here would be a promise about the customer's money.
//   * Auto-renew on/off — there is nothing to turn off.
//   * The saved payment method card — no payment method is stored; the
//     gateway is handed the card at checkout and keeps nothing here.
//   * "Cancel membership" — a plan choice is a preference, not a contract.
//     Changing it is what the Plans page already does.
//
// What is left is true: which plan, what it costs, and when it was chosen.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { myPlan, type Plan } from '@/lib/plans';
import { useIdentity } from '@/lib/identity';

type State = { plan: Plan | null } | { signedOut: true } | null;

const rupees = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

export function MembershipCard() {
  const state = usePlan();

  if (state === null) {
    return (
      <section className="card">
        <div className="card-head">
          <div>
            <h2>Your current membership</h2>
            <div className="sub">Loading your plan…</div>
          </div>
        </div>
      </section>
    );
  }

  if ('signedOut' in state) {
    return (
      <section className="card">
        <div className="card-head">
          <div>
            <h2>Your current membership</h2>
            <div className="sub">Sign in to see your plan</div>
          </div>
        </div>
        <div className="membership">
          <div className="actions">
            <Link className="btn primary" href="/login?next=%2Fbilling">
              Log in
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const { plan } = state;

  return (
    <section className="card">
      <div className="card-head">
        <div>
          <h2>Your current membership</h2>
          <div className="sub">The plan you chose</div>
        </div>
        <span className="badge">{plan ? 'Active' : 'No plan'}</span>
      </div>
      <div className="membership">
        <div className="membership-main">
          <div>
            <div className="plan-top">
              <div className="plan-icon">{plan?.icon ?? '✦'}</div>
              <div>
                <div
                  className="eyebrow"
                  style={{ color: '#ff9c83', letterSpacing: '1px' }}
                >
                  HelloFit membership
                </div>
                <h3>{plan ? plan.name : 'No plan chosen yet'}</h3>
              </div>
            </div>
            <p>
              {plan?.description ??
                'Choosing a plan is optional — you can book a trainer without one.'}
            </p>
          </div>
          {plan && (
            <div className="membership-price">
              <strong>{rupees(plan.priceMonthly)}</strong>
              <span>{plan.billingCaption ?? 'per month'}</span>
            </div>
          )}
        </div>
        <div className="actions">
          <Link className="btn primary" href="/plans">
            {plan ? 'Change plan' : 'See the plans'}
          </Link>
          <Link className="btn" href="/find-a-trainer">
            Find a Trainer
          </Link>
        </div>
      </div>
    </section>
  );
}

export function MembershipSummary() {
  const state = usePlan();
  const identity = useIdentity();
  const plan = state && 'plan' in state ? state.plan : null;

  return (
    <section className="card">
      <div className="card-head">
        <div>
          <h2>Membership summary</h2>
          <div className="sub">A snapshot of your plan</div>
        </div>
      </div>
      <div className="side-content">
        <div className="side-row">
          <span>Current plan</span>
          <strong id="summaryPlan">{plan?.name ?? 'None'}</strong>
        </div>
        <div className="side-row">
          <span>Plan price</span>
          <strong id="summaryFee">
            {plan ? `${rupees(plan.priceMonthly)} / month` : '—'}
          </strong>
        </div>
        <div className="side-row">
          <span>Yearly price</span>
          <strong>{plan ? `${rupees(plan.priceYearly)} / month` : '—'}</strong>
        </div>
        <div className="side-row">
          <span>Account</span>
          <strong>{identity.name}</strong>
        </div>
      </div>
    </section>
  );
}

/** One fetch, two cards — both read the same `/plans/mine`. */
function usePlan(): State {
  const [state, setState] = useState<State>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const plan = await myPlan();
      if (cancelled) return;

      // `undefined` is "no token"; `null` is "signed in, no plan chosen".
      setState(plan === undefined ? { signedOut: true } : { plan });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
