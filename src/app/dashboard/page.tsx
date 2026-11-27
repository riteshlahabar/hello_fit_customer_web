import type { Metadata } from 'next';
import './page.css';
import { LiveSections } from './LiveSections';
import { DashboardNav } from './DashboardNav';
import { LiveGoalCard, LiveGreeting, LiveStats } from './LiveIdentity';
import { BookSessionButton } from './BookSessionButton';
import { AccountSidebar } from '@/components/AccountSidebar';
import { RequireSignIn } from '@/components/RequireSignIn';

/**
 * Converted from the demo's hellofit-customer-dashboard.html.
 * The markup and styling are the client's design; only the mechanics are React.
 *
 * **One panel, from 27-11-2026.** The demo built this page as six stacked
 * `.page-panel` sections — Overview, My Bookings, Saved Trainers, Fitness
 * Goals, My Profile, Settings — that its sidebar swapped between, while four
 * of those five also existed as real routes with better versions of the same
 * thing. So the sidebar's My Bookings showed a plainer list than the avatar
 * dropdown's, and its My Profile a shorter form than `/profile`.
 *
 * The client had that collapsed: every row of the account sidebar is a link to
 * a real page, this page keeps Overview alone, and the shared
 * `AccountSidebar` replaces the copy that used to be written out here. The
 * Settings panel went with them — its three notification switches saved
 * nothing and duplicated `/notifications`, which is wired.
 *
 * Deleted in the same pass: `LiveBookingsPanel` (absorbed by
 * `/my-bookings`), `LiveProfileForm` (by `/profile`) and `LiveUserMini` (the
 * shared sidebar brings `AccountUserMini`).
 */

export const metadata: Metadata = {
  title: "HelloFit | Customer Dashboard",
};

export default function DashboardPage() {
  return (
    <div data-hf-page="dashboard">
      <RequireSignIn />
      <DashboardNav />

      <div className="layout">
        <div className="hf-account-shell">
          <AccountSidebar current="/dashboard" />

          <main className="main hf-account-main">
            <div id="notice" className="notice"></div>

            <div className="welcome">
              <div>
                <div className="eyebrow">YOUR WELLNESS JOURNEY</div>
                <LiveGreeting />
                <p>Small steps today. Stronger you tomorrow.</p>
              </div>
              <BookSessionButton />
            </div>

            <LiveStats />

            <div className="section">
              <div className="section-head">
                <div>
                  <h2>Your next session</h2>
                  <p>You&apos;re one session closer to your goals.</p>
                </div>
                <span className="status confirmed">● Confirmed</span>
              </div>
              <LiveSections />

              <div className="section">
                <div className="section-head">
                  <div>
                    <h2>Your monthly goal</h2>
                    <p>Consistency is your superpower.</p>
                  </div>
                  <span style={{ fontSize: "22px" }}>🎯</span>
                </div>
                <LiveGoalCard />
              </div>
            </div>
          </main>
        </div>
      </div>

      <div className="modal-backdrop" id="modalBackdrop"><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><h3 id="modalTitle">Booking details</h3><p id="modalText"></p><div id="modalFields"></div><div className="modal-actions"><button className="small-btn" id="modalClose">Close</button><button className="primary" id="modalConfirm">Confirm</button></div></div></div>
    </div>
  );
}
