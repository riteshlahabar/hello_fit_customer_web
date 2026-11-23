'use client';

// A ticking clock for the dashboard countdown.
//
// Before this (23-11-2026) the countdown was computed once, while the page
// rendered, and then never again: it still read "02 DAYS" an hour later, and
// a session that had already finished stayed on screen with its numbers
// frozen at zero until the customer reloaded. The clock has to be read on a
// timer for the panel to tell the truth.

import { useEffect, useState } from 'react';

/**
 * `Date.now()`, re-read every `everyMs` so the component re-renders with it.
 *
 * One second, not one minute: the countdown prints minutes, but the rollover
 * to the next session has to happen *when* the session ends, not up to a
 * minute afterwards.
 *
 * The timer starts in an effect, so the server render and the first client
 * render share the same value and hydration stays quiet.
 */
export function useNow(everyMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), everyMs);
    return () => clearInterval(timer);
  }, [everyMs]);

  return now;
}
