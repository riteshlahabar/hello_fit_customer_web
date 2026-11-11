'use client';

// The live notification list. The demo shipped seven fixed notices; these are
// the rows `/app/notifications` holds for the signed-in customer.
//
// Two buttons the design draws that the API cannot honour, and what they do
// instead of nothing:
//
// - **Dismiss (×)** — there is no delete route. It marks the notice read and
//   drops it from this view; a reload brings it back as read. Hiding it
//   permanently would need a `deletedAt` write the API does not expose.
// - **Mark as unread (◉)** — `markRead` is one-way, so the control is only
//   rendered on unread rows, where it is the "mark as read" tick the design
//   also specifies.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getNotices, markAllNoticesRead, markNoticeRead } from '@/lib/notifications';
import type { Notice, NoticeCategory } from '@/lib/notifications';

type Filter = 'all' | 'unread' | NoticeCategory;

const TABS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'booking', label: 'Bookings' },
  { id: 'payment', label: 'Payments' },
  { id: 'offer', label: 'Offers' },
];

export function NoticeList() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await getNotices();
      if (cancelled) return;

      if (result.unauthorised) {
        router.replace('/login');
        return;
      }

      setError(result.error ?? null);
      setNotices(result.notices);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const rows = notices ?? [];
  const unread = rows.filter((n) => n.unread).length;

  const shown = rows.filter((n) =>
    filter === 'all' ? true : filter === 'unread' ? n.unread : n.category === filter,
  );

  async function readOne(id: string) {
    setNotices((current) =>
      (current ?? []).map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
    await markNoticeRead(id);
  }

  async function dismiss(id: string) {
    setNotices((current) => (current ?? []).filter((n) => n.id !== id));
    await markNoticeRead(id);
  }

  async function readAll() {
    setNotices((current) => (current ?? []).map((n) => ({ ...n, unread: false })));
    await markAllNoticesRead();
  }

  return (
    <section className="card">
      <div className="card-head">
        <div>
          <h2>Your notifications</h2>
          <div className="sub">
            <span id="unreadTotal">{unread}</span> unread update{unread === 1 ? '' : 's'} · Latest activity first
          </div>
        </div>
        <button className="text-btn" id="markAll" onClick={readAll} disabled={unread === 0}>
          Mark all as read ✓
        </button>
      </div>

      <div className="tabs" id="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab${filter === tab.id ? ' active' : ''}`}
            data-filter={tab.id}
            onClick={() => setFilter(tab.id)}
          >
            {tab.label}
            {tab.id === 'all' && <span className="count" id="allCount">{rows.length}</span>}
            {tab.id === 'unread' && <span className="count" id="unreadCount">{unread}</span>}
          </button>
        ))}
      </div>

      <div className="notice-list" id="noticeList">
        {shown.map((notice) => (
          <article
            key={notice.id}
            className={`notice${notice.unread ? ' unread' : ''}`}
            data-id={notice.id}
            data-category={notice.category}
            data-unread={notice.unread}
          >
            <div className={`notice-icon${notice.tone ? ` ${notice.tone}` : ''}`}>{notice.icon}</div>
            <div className="notice-content">
              <h3>{notice.title}</h3>
              <p>{notice.body}</p>
              <time>{notice.when} · {notice.kind}</time>
            </div>
            <div className="notice-actions">
              {notice.unread && (
                <button
                  className="mini-btn read-btn"
                  title="Mark as read"
                  aria-label="Mark as read"
                  onClick={() => void readOne(notice.id)}
                >
                  ✓
                </button>
              )}
              <button
                className="mini-btn delete-btn"
                title="Dismiss"
                aria-label="Dismiss"
                onClick={() => void dismiss(notice.id)}
              >
                ×
              </button>
            </div>
          </article>
        ))}
      </div>

      {notices === null && !error && (
        <div className="empty" id="empty">Loading your notifications…</div>
      )}
      {error && <div className="empty" id="empty">{error}</div>}
      {notices !== null && shown.length === 0 && (
        <div className="empty" id="empty">
          <strong>You&apos;re all caught up!</strong>
          {rows.length === 0 ? 'Booking and payment updates will appear here.' : 'No notifications match this view.'}
        </div>
      )}
    </section>
  );
}
