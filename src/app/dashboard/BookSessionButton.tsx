'use client';

// The dashboard's "Book a session" button, which did nothing until now.
//
// The demo drove it from an inline <script> the parse5 conversion dropped, so
// it shipped as a bare `<button id="bookNew">` with no handler — see the same
// pattern on the login tabs and the sidebar hamburger.
//
// **Where it goes is the demo's own answer, not a guess.** Its script opened a
// placeholder modal whose confirm button read "Find a trainer" and called
// `findTrainers()`, which was the stub `toast('Connect this button to the Find
// a Trainer page.')`. The modal collected a session type and format that
// /find-a-trainer asks for itself, so it is dropped rather than rebuilt. This
// is also the booking flow the PDF describes (§3.6): the customer searches,
// picks a provider, then sends the request.
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
      onClick={() => router.push('/find-a-trainer')}>
      ＋ &nbsp; Book a session
    </button>
  );
}
