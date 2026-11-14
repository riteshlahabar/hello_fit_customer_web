import Link from 'next/link';
import type { Metadata } from 'next';
import { AccountSidebar } from '@/components/AccountSidebar';
import { RefundList } from './RefundList';
import './page.css';

/**
 * Converted from the demo's hellofit-refunds-cancellation-requests.html.
 * The markup and styling are the client's design; only the mechanics are React.
 */

export const metadata: Metadata = {
  title: "HelloFit | Refunds & Cancellation Requests",
};

export default function RefundsPage() {
  return (
    <div data-hf-page="refunds">
      <main className="container"><div className="hf-account-shell"><AccountSidebar current="/refunds" /><div className="hf-account-main"><div className="crumb">Home / Customer Area / Support / <b>Refunds & Cancellation Requests</b></div><section className="hero"><div><div className="eyebrow">Clear, simple, transparent</div><h1>REFUNDS &<br />CANCELLATION REQUESTS</h1><p>Need to change plans or request a refund for a booking? Submit a request, review its status, and find important policy information in one place.</p></div><div className="hero-art">↩️</div></section><div className="layout"><div><RefundList /></div><aside><section className="card"><div className="card-head"><div><h2>Before you submit</h2><div className="sub">A few helpful things to know</div></div></div><div className="policy"><div className="policy-item"><div className="policy-icon">📅</div><div><strong>Booking cancellations</strong><p>Eligibility can depend on how close you are to the scheduled session and the applicable trainer cancellation terms.</p></div></div><div className="policy-item"><div className="policy-icon">₹</div><div><strong>Refund timelines</strong><p>Approved refunds may take additional time to appear, depending on your original payment method and provider.</p></div></div><div className="policy-item"><div className="policy-icon">🔁</div><div><strong>Membership cancellation</strong><p>Check the effective cancellation date and whether any paid access remains before confirming a cancellation.</p></div></div><div className="policy-item"><div className="policy-icon">🧾</div><div><strong>Keep your reference</strong><p>Include your booking ID or invoice number so the support team can identify the transaction.</p></div></div></div><div className="notice">The policy notes above are general prototype guidance, not final legal terms. Publish your approved refund, cancellation, no-show and subscription policies before launch.</div></section><section className="card"><div className="card-head"><div><h2>Request status guide</h2><div className="sub">What each status means</div></div></div><div className="policy"><div className="policy-item"><div className="policy-icon">🟡</div><div><strong>Under review</strong><p>Your request has been received and needs to be reviewed by the support team.</p></div></div><div className="policy-item"><div className="policy-icon">🟢</div><div><strong>Approved / resolved</strong><p>A decision has been recorded. Refund settlement, if applicable, may still depend on the payment provider.</p></div></div><div className="policy-item"><div className="policy-icon">🔴</div><div><strong>More information needed</strong><p>The support team may need additional details before it can make a decision.</p></div></div></div></section><section className="card"><div className="card-head"><div><h2>Need help now?</h2><div className="sub">Our support page is here for you</div></div></div><div className="notice" style={{ marginTop: "0" }}><strong style={{ color: "#29231e" }}>Not sure which request to choose?</strong><br />Visit Help & Support for common questions and contact options.</div><div style={{ padding: "0 22px 20px" }}><Link className="primary full" href="/help">Visit Help &amp; Support →</Link></div></section></aside></div></div></div></main><div className="modal-backdrop" id="modal"><div className="modal"><div className="eyebrow">Request received</div><h2 id="modalTitle">Demo request submitted</h2><p id="modalText">Your request has been added to the demo list.</p><div className="modal-actions"><button className="primary" id="modalClose">Done</button></div></div></div>
    </div>
  );
}
