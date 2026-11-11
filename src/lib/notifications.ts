'use client';

// In-app notifications — `/app/notifications`, the same list the mobile apps
// read. The design's seven sample notices are gone; these are the rows the
// backend's outbox actually wrote for this account.
//
// The design groups them into Bookings / Payments / Offers. The API has no
// category column — it has an `eventKey` (28 of them, `events.ts`) — so the
// grouping is derived from the key's prefix below. That is a presentation
// choice, not invented data: every key lands in exactly one bucket, and keys
// that belong to none are reachable under "All".

import { apiGetResult, apiSend } from './api';
import { tokenStore } from './auth';

export type NoticeCategory = 'booking' | 'payment' | 'offer' | 'other';

export interface Notice {
  id: string;
  title: string;
  body: string;
  category: NoticeCategory;
  unread: boolean;
  /** "10 minutes ago". The design shows relative time, not a timestamp. */
  when: string;
  /** The caption after the dot — "Booking update", "Payment". */
  kind: string;
  icon: string;
  /** Extra class on the icon chip; the design colours it per category. */
  tone: '' | 'green' | 'blue' | 'purple';
  href?: string;
}

interface ApiNotice {
  id: string;
  eventKey: string;
  title: string;
  body: string;
  deepLink: string | null;
  readAt: string | null;
  createdAt: string;
}

const CATEGORY: [RegExp, NoticeCategory][] = [
  [/^(booking|session|assignment|offer)\./, 'booking'],
  [/^(refund|wallet|payout)\./, 'payment'],
  [/^(campaign|membership)\./, 'offer'],
];

const categoryOf = (eventKey: string): NoticeCategory =>
  CATEGORY.find(([pattern]) => pattern.test(eventKey))?.[1] ?? 'other';

/** Icon and caption per category, taken from the design's own notice cards. */
const LOOK: Record<NoticeCategory, { icon: string; tone: Notice['tone']; kind: string }> = {
  booking: { icon: '📅', tone: '', kind: 'Booking update' },
  payment: { icon: '₹', tone: 'blue', kind: 'Payment' },
  offer: { icon: '✨', tone: 'purple', kind: 'HelloFit offers' },
  other: { icon: '💪', tone: 'green', kind: 'Update' },
};

/** A confirmation reads better with a tick than a calendar. */
const CONFIRMED = /\.(confirmed|completed|published|verified|credited|paid)$/;

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "10 minutes ago", "Yesterday", "1 week ago" — the design's own wording. */
export function relativeTime(iso: string, now = Date.now()): string {
  const gap = now - new Date(iso).getTime();

  if (gap < MINUTE) return 'Just now';
  if (gap < HOUR) {
    const minutes = Math.round(gap / MINUTE);
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }
  if (gap < DAY) {
    const hours = Math.round(gap / HOUR);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  const days = Math.round(gap / DAY);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.round(days / 7);
  return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
}

function toNotice(row: ApiNotice): Notice {
  const category = categoryOf(row.eventKey);
  const look = LOOK[category];

  return {
    id: row.id,
    title: row.title,
    body: row.body,
    category,
    unread: row.readAt === null,
    when: relativeTime(row.createdAt),
    kind: look.kind,
    icon: CONFIRMED.test(row.eventKey) ? '✓' : look.icon,
    tone: CONFIRMED.test(row.eventKey) ? 'green' : look.tone,
    // `deepLink` is written for the mobile apps (hellofit://…), so only a
    // path the website actually serves is followed.
    href: row.deepLink?.startsWith('/') ? row.deepLink : undefined,
  };
}

export interface NoticesResult {
  notices: Notice[];
  unread: number;
  unauthorised?: boolean;
  error?: string;
}

export async function getNotices(): Promise<NoticesResult> {
  const token = tokenStore.access;
  if (!token) return { notices: [], unread: 0, unauthorised: true };

  const result = await apiGetResult<ApiNotice[]>('/app/notifications?limit=50', { token });

  if (!result.ok) {
    return {
      notices: [],
      unread: 0,
      unauthorised: result.error.status === 401,
      error: result.error.message,
    };
  }

  const meta = result.meta as { unread?: number } | undefined;

  return { notices: result.data.map(toNotice), unread: meta?.unread ?? 0 };
}

/** Returns the server's new unread count, so the header badge stays honest. */
export async function markNoticeRead(id: string): Promise<number | null> {
  const token = tokenStore.access;
  if (!token) return null;

  const result = await apiSend<{ unread: number }>(
    `/app/notifications/${id}/read`,
    'POST',
    undefined,
    token,
  );

  return result.ok ? result.data.unread : null;
}

export async function markAllNoticesRead(): Promise<boolean> {
  const token = tokenStore.access;
  if (!token) return false;

  const result = await apiSend('/app/notifications/read-all', 'POST', undefined, token);
  return result.ok;
}

// ----------------------------------------------------------- preferences

/**
 * The three channel switches the design offers are exactly the API's
 * `NotificationChannel` values, at the `*` ("every event") sentinel — so they
 * map one to one and are wired. Its fourth switch, "Offers & fitness tips",
 * is a topic rather than a channel and has no counterpart: preferences are
 * stored per (channel, event), and there is no "offers" grouping to flip.
 */
export type PrefChannel = 'EMAIL' | 'SMS' | 'PUSH';

export const PREF_CHANNELS: PrefChannel[] = ['EMAIL', 'SMS', 'PUSH'];

interface ApiPreferences {
  defaultEnabled: boolean;
  overrides: { channel: string; eventKey: string; enabled: boolean }[];
}

/** A channel with no stored row means "send everything" — hence the default. */
export async function getChannelPrefs(): Promise<Record<PrefChannel, boolean> | null> {
  const token = tokenStore.access;
  if (!token) return null;

  const result = await apiGetResult<ApiPreferences>('/app/notifications/preferences', { token });
  if (!result.ok) return null;

  const prefs = {} as Record<PrefChannel, boolean>;

  for (const channel of PREF_CHANNELS) {
    const row = result.data.overrides.find((o) => o.channel === channel && o.eventKey === '*');
    prefs[channel] = row ? row.enabled : result.data.defaultEnabled;
  }

  return prefs;
}

export async function setChannelPref(channel: PrefChannel, enabled: boolean): Promise<boolean> {
  const token = tokenStore.access;
  if (!token) return false;

  const result = await apiSend(
    '/app/notifications/preferences',
    'PUT',
    { channel, eventKey: '*', enabled },
    token,
  );

  return result.ok;
}
