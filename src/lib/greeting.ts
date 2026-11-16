// The time-of-day greeting, in one place so every surface says the same thing.
//
// The dashboard hard-coded "Good morning ☀️" at every hour of the day, which
// read as broken to anyone signing in after lunch. Client's instruction,
// 16 Nov 2026: make it follow the clock, and make it standard.
//
// **Three bands, not four.** "Good night" is a farewell in English, not a
// greeting, so late evening stays "Good evening" and only the icon darkens.

export interface Greeting {
  text: string;
  /** The emoji the demo puts beside the heading. */
  icon: string;
}

/**
 * Indexed by band so a caller can hold a number rather than an object.
 *
 * That matters: the only safe way to read the clock during render is
 * `useSyncExternalStore`, and its snapshot must be referentially stable or the
 * component re-renders for ever. A number is; a fresh `{ text, icon }` is not.
 */
// Capitalised on the client's instruction, 16 Nov 2026 — "Good Morning", not
// "Good morning". The demo wrote it lower case; this overrides that.
export const GREETINGS: readonly Greeting[] = [
  { text: 'Good Morning', icon: '☀️' },
  { text: 'Good Afternoon', icon: '🌤️' },
  { text: 'Good Evening', icon: '🌙' },
];

/** 0 before noon, 1 until 17:00, 2 after. */
export function greetingBand(date: Date = new Date()): number {
  const hour = date.getHours();
  if (hour < 12) return 0;
  if (hour < 17) return 1;
  return 2;
}

/**
 * What the server renders.
 *
 * A server render has no idea what time it is where the reader is, so it
 * cannot be right — it only has to be *stable*, or hydration mismatches.
 * React's `getServerSnapshot` exists for exactly this: the client corrects it
 * on mount without a warning.
 */
export const SERVER_GREETING_BAND = 0;
