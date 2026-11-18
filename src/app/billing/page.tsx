import Link from 'next/link';
import type { Metadata } from 'next';
import { AccountSidebar } from '@/components/AccountSidebar';
import { InvoiceTable } from './InvoiceTable';
import './page.css';

/**
 * Converted from the demo's hellofit-membership-management-billing-history.html.
 * The markup and styling are the client's design; only the mechanics are React.
 *
 * **The membership half is gone** (17 Nov 2026). Membership plans were
 * deleted — the client reads "plan" as "package" — so `GET /plans/mine` no
 * longer exists and the two cards that read it ("Your current membership"
 * and "Membership summary") went with it. Nothing replaced them: a package
 * belongs to a booking, not to the customer, so it shows on the invoice for
 * that booking rather than as a standing status here.
 *
 * What is left is the invoice history, which was always the page's substance.
 */

export const metadata: Metadata = {
  title: 'HelloFit | Billing History',
};

export default function BillingPage() {
  return (
    <div data-hf-page="billing">
      <main className="container"><div className="hf-account-shell"><AccountSidebar current="/billing" /><div className="hf-account-main"><div className="crumb">Home / Customer Area / Billing / <b>Billing History</b></div><section className="hero"><div><div className="eyebrow">Every receipt in one place</div><h1>BILLING HISTORY</h1><p>Find every invoice for your bookings in one place, with the GST breakup and a receipt you can download.</p></div><div className="hero-art">💳</div></section><div className="grid"><div><InvoiceTable /></div><aside><section className="card"><div className="card-head"><div><h2>Need a hand?</h2><div className="sub">We can help with billing questions</div></div></div><div className="helpbox"><h3>Questions about a charge?</h3><p>For a billing concern, cancellation question or invoice request, visit the HelloFit support page.</p><Link className="btn primary" href="/support-tickets">Contact support →</Link></div></section></aside></div></div></div></main>
    </div>
  );
}
