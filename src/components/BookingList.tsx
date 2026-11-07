'use client';

import { useMemo, useState } from 'react';
import {
  bookings as allBookings,
  formatBookingDate,
  money,
  statusLabel,
  type BookingStatus,
} from '@/data/bookings';
import { useToast } from './Toast';

type Filter = 'all' | BookingStatus;
type Sort = 'newest' | 'oldest' | 'priceHigh' | 'priceLow';

const TABS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All bookings' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const SERVICES = [
  'Personal Yoga Session',
  'Yoga & Flexibility',
  'Online Yoga Session',
  'Strength Training',
];

/**
 * The bookings tabs, filters and list.
 *
 * The demo built this with innerHTML from a `bookings` array; this is the same behaviour in
 * React — same markup, same classes, same filter/search/sort rules. The data comes from
 * `@/data/bookings`, which is shaped like the API response, so wiring the real endpoint
 * means replacing one import.
 */
export function BookingList() {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [service, setService] = useState('all');
  const [sort, setSort] = useState<Sort>('newest');
  const showToast = useToast();

  const counts = useMemo(
    () => ({
      all: allBookings.length,
      upcoming: allBookings.filter((b) => b.status === 'upcoming').length,
      completed: allBookings.filter((b) => b.status === 'completed').length,
      cancelled: allBookings.filter((b) => b.status === 'cancelled').length,
    }),
    [],
  );

  const list = useMemo(() => {
    const q = query.toLowerCase().trim();
    return allBookings
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
  }, [filter, query, service, sort]);

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
          {SERVICES.map((s) => (
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

            <aside className="booking-side">
              <div className="price-wrap">
                <div className="price-label">Session total</div>
                <div className="price">{money(b.price)}</div>
                <div className="ref">Ref: {b.id}</div>
              </div>

              <button
                className="btn btn-light"
                onClick={() => showToast(`Booking ${b.id} — detail view is part of the next stage.`)}
              >
                View details ↗
              </button>

              {b.status === 'upcoming' ? (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => showToast('Reschedule will be connected to the booking API.')}
                  >
                    Reschedule
                  </button>
                  <button
                    className="btn btn-light"
                    onClick={() => showToast('Cancellation follows the refund slabs in settings.')}
                  >
                    Cancel booking
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-light"
                    onClick={() => showToast('Receipts come from the invoice endpoint.')}
                  >
                    View receipt
                  </button>
                  {b.status === 'completed' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => showToast('Book again will prefill the booking flow.')}
                    >
                      Book again
                    </button>
                  )}
                </>
              )}
            </aside>
          </article>
        ))}
      </div>

      {list.length === 0 && (
        <div className="empty">
          <div className="big">⌕</div>
          <h3>No bookings found</h3>
          <p>Try another search or filter, or book your next session.</p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setFilter('all');
              setQuery('');
              setService('all');
            }}
          >
            Find a trainer
          </button>
        </div>
      )}
    </>
  );
}
