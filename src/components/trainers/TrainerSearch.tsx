'use client';

// Find a Trainer — PDF §5.5. The search panel, the filter sidebar and the
// results list, driven by `GET /providers`.
//
// A client component because every filter is interactive and the API is public
// and uncached — a server render would freeze the first result set into the
// page. The initial rows are still rendered on the server and passed in, so
// the page is never briefly empty.
//
// **There is no static fallback.** If the API fails this shows the error, not
// the demo's six invented trainers: a fake person with a Book button is worse
// than an empty list.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  searchProviders,
  type ProviderCard,
  type ProviderFilters,
  type ProviderSort,
  type SearchMeta,
} from '@/lib/providers';
import { ProviderResultCard, type BookingContextProps } from './ProviderResultCard';
import { TrainerFilters, type FilterOption } from './TrainerFilters';
import { TrainerSearchPanel } from './TrainerSearchPanel';

interface Props {
  initialRows: ProviderCard[];
  initialMeta: SearchMeta | null;
  initialError: string | null;
  categories: FilterOption[];
  cities: FilterOption[];
  /**
   * Filters already applied by the server, from the URL — the homepage's
   * category cards link here as `?categoryId=…`. They must seed this state,
   * not just the server's first fetch: otherwise the sidebar renders with
   * nothing ticked while the list is filtered, and the visitor's first click
   * anywhere silently widens the search back out.
   */
  initialFilters?: ProviderFilters;
  /**
   * Set when the visitor arrived from a package card, so the list is already
   * narrowed to one service. It turns each card's primary button into
   * "Select trainer", which carries service, package and trainer straight to
   * the booking wizard (client, 21 Nov 2026).
   */
  booking?: BookingContextProps;
}

const EMPTY: ProviderFilters = { page: 1 };

export function TrainerSearch({
  initialRows,
  initialMeta,
  initialError,
  categories,
  cities,
  initialFilters,
  booking,
}: Props) {
  const [filters, setFilters] = useState<ProviderFilters>(
    initialFilters ?? EMPTY,
  );
  const [rows, setRows] = useState(initialRows);
  const [meta, setMeta] = useState(initialMeta);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  // The first render already has the server's rows; re-fetching them would
  // make the page flash for no reason.
  const firstRun = useRef(true);

  const run = useCallback(async (next: ProviderFilters) => {
    setLoading(true);
    const outcome = await searchProviders(next);
    setRows(outcome.rows);
    setMeta(outcome.meta);
    setError(outcome.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    const id = setTimeout(() => void run(filters), 250);
    return () => clearTimeout(id);
  }, [filters, run]);

  const total = meta?.total ?? rows.length;

  return (
    <>
      <TrainerSearchPanel
        filters={filters}
        categories={categories}
        cities={cities}
        onChange={setFilters}
      />

      <div className="content-layout">
        <TrainerFilters
          filters={filters}
          categories={categories}
          cities={cities}
          onChange={setFilters}
          // Reset clears what the visitor chose, not what they are booking:
          // dropping the service here would list trainers who do not teach it.
          onReset={() =>
            setFilters(booking ? { ...EMPTY, serviceId: booking.serviceId } : EMPTY)
          }
        />

        <section className="results-area">
          <div className="results-head">
            <div>
              {/* The "Explore Trainers" heading was removed on the client's
                  word (27 Nov 2026) — the count line below says what the list
                  is, and the page already has one <h1> in the hero. */}
              <p>
                {loading
                  ? 'Searching…'
                  : total === 1
                    ? 'Showing 1 trainer'
                    : `Showing ${total} trainers`}
              </p>
            </div>
            <label className="sort">
              Sort by{' '}
              <select
                value={filters.sort ?? 'recommended'}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sort: e.target.value as ProviderSort,
                    page: 1,
                  })
                }
              >
                <option value="recommended">Recommended</option>
                <option value="rating">Highest rated</option>
                <option value="price">Price: low to high</option>
              </select>
            </label>
          </div>

          {/* The API sorts by price within the page only and says so in `meta`.
              Stated rather than hidden — the alternative is a list that looks
              globally sorted and is not. */}
          {meta?.priceSortIsPageOnly && (meta?.pages ?? 1) > 1 ? (
            <div className="active-filters">
              <span className="hint">Price order applies to this page of results.</span>
            </div>
          ) : null}

          <div className="trainer-list">
            {rows.map((provider) => (
              <ProviderResultCard key={provider.id} provider={provider} booking={booking} />
            ))}
          </div>

          {rows.length === 0 && !loading ? (
            <div className="empty">
              {error
                ? `We could not load trainers just now (${error}). Please try again.`
                : booking
                  ? `No trainer offers ${booking.serviceName} yet. Choose another service and we will show who teaches it.`
                  : 'No trainers match these filters yet. Try widening your search.'}
            </div>
          ) : null}

          {(meta?.pages ?? 1) > 1 ? (
            <div className="pagination">
              {Array.from({ length: meta?.pages ?? 1 }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={page === (meta?.page ?? 1) ? 'active' : undefined}
                  onClick={() => setFilters({ ...filters, page })}
                >
                  {page}
                </button>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </>
  );
}
