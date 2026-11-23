'use client';

// The dashboard's "Book a session" button, which did nothing until now.
//
// The demo drove it from an inline <script> the parse5 conversion dropped, so
// it shipped as a bare `<button id="bookNew">` with no handler — see the same
// pattern on the login tabs and the sidebar hamburger.
//
// **It goes to the home page** (client, 23-11-2026) — booking starts by
// choosing a service there, and the service is what narrows the trainer list.
// It went to `/find-a-trainer` until then, which asked for a trainer before
// the customer had said what they wanted. Either way the demo's placeholder
// modal (a session type and format that the pages ask for themselves) is
// dropped rather than rebuilt; the flow is still the PDF's §3.6 — choose,
// search, pick a provider, send the request.
//
// Still a <button>, not a <Link>: `.welcome .primary` sets `width: 100%` at the
// mobile breakpoint, and width does not apply to an inline <a>. Same element,
// same class, same id as the converted markup.

import { useRouter } from 'next/navigation';

export function BookSessionButton() {
  const router = useRouter();

  return (
    <button
      className="primary"
      id="bookNew"
      onClick={() => router.push('/')}>
      ＋ &nbsp; Book a session
    </button>
  );
}
