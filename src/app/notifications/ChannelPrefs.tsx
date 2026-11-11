'use client';

// The notification-preference card. Three of the design's four switches are
// the API's channels exactly (EMAIL, SMS, PUSH at the `*` event sentinel), so
// they read and write `/app/notifications/preferences`. Each flip is its own
// idempotent PUT — that is why the route is a PUT and not a POST.
//
// The fourth switch, "Offers & fitness tips", is left out: preferences are
// stored per (channel, event) and there is no "offers" grouping to flip, so
// wiring it would mean inventing a mapping across four channels. The row is
// kept visible and disabled rather than removed, so the client can see what
// is waiting on their decision.

import { useEffect, useState } from 'react';
import { getChannelPrefs, setChannelPref } from '@/lib/notifications';
import type { PrefChannel } from '@/lib/notifications';

const ROWS: { channel: PrefChannel; icon: string; title: string; desc: string }[] = [
  { channel: 'EMAIL', icon: '✉', title: 'Email notifications', desc: 'Booking confirmations and receipts' },
  { channel: 'SMS', icon: '▣', title: 'SMS reminders', desc: 'Important updates to your phone' },
  { channel: 'PUSH', icon: '♧', title: 'Push notifications', desc: 'Quick alerts on this device' },
];

export function ChannelPrefs() {
  const [prefs, setPrefs] = useState<Record<PrefChannel, boolean> | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const loaded = await getChannelPrefs();
      if (!cancelled) setPrefs(loaded);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function toggle(channel: PrefChannel, enabled: boolean) {
    // Optimistic, then reverted if the server refuses — a switch that waits
    // for a round trip reads as broken.
    setPrefs((current) => (current ? { ...current, [channel]: enabled } : current));

    const ok = await setChannelPref(channel, enabled);
    if (!ok) setPrefs((current) => (current ? { ...current, [channel]: !enabled } : current));
  }

  return (
    <section className="card settings-card">
      <div className="card-head">
        <div>
          <h2>Notification preferences</h2>
          <div className="sub">Choose what you&apos;d like to receive</div>
        </div>
      </div>
      <div className="settings-section">
        {ROWS.map((row) => (
          <div className="setting-row" key={row.channel}>
            <div className="setting-left">
              <div className="setting-ico">{row.icon}</div>
              <div>
                <div className="setting-title">{row.title}</div>
                <div className="setting-desc">{row.desc}</div>
              </div>
            </div>
            <input
              className="switch pref"
              type="checkbox"
              aria-label={row.title}
              checked={prefs?.[row.channel] ?? true}
              disabled={prefs === null}
              onChange={(e) => void toggle(row.channel, e.target.checked)}
            />
          </div>
        ))}
        <div className="setting-row">
          <div className="setting-left">
            <div className="setting-ico">🏷</div>
            <div>
              <div className="setting-title">Offers &amp; fitness tips</div>
              <div className="setting-desc">Promotions, tips and motivation</div>
            </div>
          </div>
          <input className="switch pref" type="checkbox" aria-label="Offers and fitness tips" disabled={true} />
        </div>
      </div>
    </section>
  );
}
