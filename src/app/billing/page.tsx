import Link from 'next/link';
import type { Metadata } from 'next';
import { AccountSidebar } from '@/components/AccountSidebar';
import { InvoiceTable } from './InvoiceTable';
import { MembershipCard, MembershipSummary } from './Membership';
import './page.css';

/**
 * Converted from the demo's hellofit-membership-management-billing-history.html.
 * The markup and styling are the client's design; only the mechanics are React.
 */

export const metadata: Metadata = {
  title: "HelloFit | Membership Management & Billing History",
};

export default function BillingPage() {
  return (
    <div data-hf-page="billing">
      <main className="container"><div className="hf-account-shell"><AccountSidebar current="/billing" /><div className="hf-account-main"><div className="crumb">Home / Customer Area / Membership / <b>Management & Billing History</b></div><section className="hero"><div><div className="eyebrow">Your membership, in your hands</div><h1>MEMBERSHIP MANAGEMENT<br />& BILLING HISTORY</h1><p>Review the plan you chose and find every invoice for your bookings in one place, with the GST breakup and a receipt you can download.</p></div><div className="hero-art">💳</div></section><div className="grid"><div><MembershipCard /><InvoiceTable /></div><aside><MembershipSummary /><section className="card"><div className="card-head"><div><h2>Need a hand?</h2><div className="sub">We can help with billing questions</div></div></div><div className="helpbox"><h3>Questions about a charge?</h3><p>For a billing concern, cancellation question or invoice request, visit the HelloFit support page.</p><Link className="btn primary" href="/support-tickets">Contact support →</Link></div></section></aside></div></div></div></main>
    </div>
  );
}
