import Link from 'next/link';
import type { Metadata } from 'next';
import './page.css';
import { AuthPanel } from './AuthPanel';

/**
 * Converted from the demo's hellofit-customer-login-registration.html.
 * The markup and styling are the client's design; only the mechanics are React.
 */

export const metadata: Metadata = {
  title: "Login & Registration | HelloFit",
};

export default function LoginPage() {
  return (
    <div data-hf-page="login">
      <header className="top"><Link className="brand" href="/"><img src="/hellofit-logo.png" alt="HelloFit logo" /><span><strong>HELLOFIT</strong><small>MOVE BETTER. LIVE STRONGER.</small></span></Link><Link className="back" href="/">← Back to website</Link></header><main className="layout"><section className="story"><div><div className="eyebrow">Your fitness journey starts here</div><h1>Make time<br />for <em>you.</em></h1><p>Find your trainer, book sessions that fit your life, and build a routine that feels good — one step at a time.</p><div className="perks"><div className="perk"><b>Trainers you trust</b><span>Find the right fit for your goals</span></div><div className="perk"><b>Your schedule</b><span>Sessions that work around you</span></div></div></div><div className="quote">“Small steps every day add up to big change.”<b>— The HelloFit mindset</b></div></section>{/* The right-hand panel is a client component: the demo drove its tabs
          from an inline script the conversion dropped. */}
        <AuthPanel /></main>
    </div>
  );
}
