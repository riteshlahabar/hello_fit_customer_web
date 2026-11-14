import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SessionDetails } from './SessionDetails';
import './page.css';

/**
 * Converted from the demo's hellofit-workout-session-details-instructions.html.
 * The markup and styling are the client's design; only the mechanics are React.
 *
 * Reached as `/session-details?booking=<id>` (optionally `&session=<id>`).
 * The session facts are live; the preparation guide is the design's own copy.
 * See WorkoutGuide.tsx for the three demo blocks that are not rendered and why.
 */

export const metadata: Metadata = {
  title: "HelloFit | Session Details",
};

export default function SessionDetailsPage() {
  return (
    <div data-hf-page="session-details">
      

      <main className="shell">
        <Suspense fallback={<section className="hero"><p>Loading your session…</p></section>}>
          <SessionDetails />
        </Suspense>
        
      </main>
    </div>
  );
}
