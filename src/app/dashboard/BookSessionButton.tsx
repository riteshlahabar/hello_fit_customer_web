'use client';

// The dashboard's two "Book a session" buttons — the one on Overview and the
// one on the My Bookings panel, which was still bare markup.
//
// The demo drove both from an inline <script> the parse5 conversion dropped,
// so they shipped as bare `<button id="…">` with no handler — see the same
// pattern on the login tabs and the sidebar hamburger.
//
// **It goes to the packages page** (client, 23-11-2026, superseding the same
// morning's "go to the home page"): booking starts by choosing a service, and
// `/packages` is the page that asks for one — its picker prices the package
// cards against the service chosen, and nothing shows until one is. The home
// page only searches, and `/find-a-trainer` (where this pointed before that)
// asked for a trainer before the customer had said what they wanted. Either
// way the demo's placeholder modal (a session type and format that the pages
// ask for themselves) is dropped rather than rebuilt; the flow is still the
// PDF's §3.6 — choose, search, pick a provider, send the request.
//
// Still a <button>, not a <Link>: `.welcome .primary` sets `width: 100%` at the
// mobile breakpoint, and width does not apply to an inline <a>. Same element,
// same class, same id as the converted markup.

import { useRouter } from 'next/navigation';

export function BookSessionButton({ id = 'bookNew' }: { id?: string }) {
  const router = useRouter();

  return (
    <button
      className="primary"
      id={id}
      onClick={() => router.push('/packages')}>
      ＋ &nbsp; Book a session
    </button>
  );
}
