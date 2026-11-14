'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  bookings as allBookings,
  formatBookingDate,
  statusLabel,
  type Booking,
  type BookingStatus,
} from "@/data/bookings";
import { BookingActions } from './BookingActions';

type Filter = 'all' | BookingStatus;
type Sort = 'newest' | 'oldest' | 'priceHigh' | 'priceLow';

const TABS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All bookings' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

/**
 * The bookings tabs, filters and list.
 *
 * The demo built this with innerHTML from a `bookings` array; this is the same behaviour in
 * React — same markup, same classes, same filter/search/sort rules. The data comes from
 * `@/data/bookings`, which is shaped like the API response, so wiring the real endpoint
 * means replacing one import.
 */
export function BookingList({ bookings = allBookings }: { bookings?: Booking[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState('');
  const [service, setService] = useState('all');
  const [sort, setSort] = useState<Sort>('newest');

  // Derived from what the customer actually has, not the demo's fixed four:
  // a filter offering services you have never booked is a dead option, and
  // one that omits a service you have booked hides rows.
  const serviceOptions = useMemo(
    () => [...new Set(bookings.map((b) => b.service))].sort(),
    [bookings],
  );

  const counts = useMemo(
    () => ({
      all: bookings.length,
      upcoming: bookings.filter((b) => b.status === 'upcoming').length,
      completed: bookings.filter((b) => b.status === 'completed').length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    }),
    [bookings],
  );

  const list = useMemo(() => {
    const q = query.toLowerCase().trim();
    return bookings
      .filter((b) => filter === 'all' || b.status === filter)
      .filter(
        (b) =>
          (!q || [b.trainer, b.service, b.id, b.location].some((x) => x.toLowerCase().includes(q))) &&
          (service === 'all' || b.service === service),
      )
      .sort((a, b) => {
        if (sort === 'oldest') return a.date.localeCompare(b.date);
        if (sort === 'priceHigh') return b.price - a.price;
        if (sort === 'priceLow') return a.price - b.price;
        return b.date.localeCompare(a.date);
      });
  }, [bookings, filter, query, service, sort]);

  return (
    <>
      <div className="tabsbar" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={tab.key === filter ? 'tab active' : 'tab'}
            type="button"
            role="tab"
            aria-selected={tab.key === filter}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label} <span>({counts[tab.key]})</span>
          </button>
        ))}
      </div>

      <div className="tools">
        <div className="search">
          <input
            type="search"
            placeholder="Search trainer, service or booking ID..."
            aria-label="Search bookings"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          aria-label="Filter by service"
          value={service}
          onChange={(e) => setService(e.target.value)}
        >
          <option value="all">All services</option>
          {serviceOptions.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          aria-label="Sort bookings"
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="priceHigh">Price: high to low</option>
          <option value="priceLow">Price: low to high</option>
        </select>
      </div>

      <div className="booking-list">
        {list.map((b) => (
          <article className="booking" key={b.id}>
            <div className="booking-main">
              <div className="booking-head">
                <div className="trainer-pic">{b.emoji}</div>
                <div>
                  <h3>{b.service}</h3>
                  <p>
                    with {b.trainer} · {b.duration}
                  </p>
                </div>
                <span className={`status ${b.status}`}>{statusLabel[b.status]}</span>
              </div>

              <div className="details">
                <div className="detail">
                  <label>Session date</label>
                  <strong>{formatBookingDate(b.date)}</strong>
                </div>
                <div className="detail">
                  <label>Time</label>
                  <strong>{b.time}</strong>
                </div>
                <div className="detail">
                  <label>Location</label>
                  <strong>{b.location}</strong>
                </div>
                <div className="detail">
                  <label>Payment</label>
                  <strong>{b.payment}</strong>
                </div>
                <div className="detail">
                  <label>Booking ID</label>
                  <strong>{b.id}</strong>
                </div>
                <div className="detail">
                  <label>Duration</label>
                  <strong>{b.duration}</strong>
                </div>
              </div>
            </div>

            <BookingActions b={b} />
          </article>
        ))}
      </div>

      {list.length === 0 && (
        <div className="empty">
          <div className="big">⌕</div>
          <h3>No bookings found</h3>
          <p>Try another search or filter, or book your next session.</p>
          {/* The button says "Find a trainer" and reset the filters instead —
              the copy above already offers "another search or filter" through
              the controls, and this is the clause about booking. Linked to the
              page it names, 13 Nov 2026. */}
          <Link className="btn btn-primary" href="/find-a-trainer">
            Find a trainer
          </Link>
        </div>
      )}
    </>
  );
}
