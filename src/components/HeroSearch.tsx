'use client';

// Hero search panel: service tabs plus the three fields.
//
// **The tabs and the service suggestions are administered, not hardcoded.**
// They were a fixed array in `src/data/home.ts` naming services that did not
// exist in the database at all ("Pilates", "Functional Fitness"), so the
// homepage advertised things nobody could book. Both now come from the live
// catalog — `GET /categories` and `GET /services` — which is exactly what the
// admin panel's Catalog screens write. Add a category or a service there and
// it appears here on the next revalidation, with no deploy.
//
// Fetched on the server by `(site)/page.tsx` and passed down, rather than
// fetched here: the hero is the first thing a crawler reads, and
// `state/decisions.md` puts the site behind a Next.js server for exactly that.
//
// Searching now goes to `/booking`, which is live end to end (services,
// slots, quote). It used to raise a toast saying the results page "will be
// built next" — there is no provider-search endpoint to build one on yet (the
// marketplace rework), and sending someone to the working booking flow is
// better than telling them to come back later.

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ApiCategory, ApiService } from '@/lib/catalog';

/** The "everything" tab the demo opens on. Not a category, so it has no id. */
const ALL = { id: '', label: 'All services' };

interface Props {
  categories: ApiCategory[];
  services: ApiService[];
}

export function HeroSearch({ categories, services }: Props) {
  const router = useRouter();

  const [activeId, setActiveId] = useState(ALL.id);
  const [service, setService] = useState('');
  const [location, setLocation] = useState('');
  const [session, setSession] = useState('');

  /**
   * One tab per active category, straight from `GET /categories` — the table
   * the admin panel's Category screen writes (PDF 6.5).
   *
   * Deriving them from the services instead was the first attempt and it was
   * wrong: 6.5's acceptance criterion is "Active categories appear on
   * customer-facing platforms", and a category created and activated but with
   * no service published under it yet would never have shown up.
   */
  const tabs = useMemo(
    () => [ALL, ...categories.map((c) => ({ id: c.id, label: c.name }))],
    [categories],
  );

  /** Suggestions narrow to the chosen tab, so the tab actually does something. */
  const suggestions = useMemo(
    () => (activeId ? services.filter((s) => s.category?.id === activeId) : services),
    [services, activeId],
  );

  function search() {
    const typed = service.trim().toLowerCase();

    // An exact service name wins; otherwise the first partial match within the
    // chosen tab. Matching by name is the only option here — the field is the
    // design's free-text input, not a select.
    const matched =
      suggestions.find((s) => s.name.toLowerCase() === typed) ??
      (typed ? suggestions.find((s) => s.name.toLowerCase().includes(typed)) : undefined);

    const params = new URLSearchParams();
    if (matched) params.set('service', matched.id);
    if (location.trim()) params.set('area', location.trim());
    if (session) params.set('session', session);

    const query = params.toString();
    router.push(query ? `/booking?${query}` : '/booking');
  }

  return (
    <div className="container hero-search-wrap">
      <div className="hero-search-panel" id="search">
        <div className="search-tabs" role="tablist" aria-label="Fitness service">
          {tabs.map((tab) => (
            <button
              key={tab.id || 'all'}
              className={tab.id === activeId ? 'search-tab active' : 'search-tab'}
              type="button"
              role="tab"
              aria-selected={tab.id === activeId}
              onClick={() => {
                setActiveId(tab.id);
                // Picking a tab clears a service that belongs to another one,
                // so the field never disagrees with the tab above it.
                setService('');
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="search-panel hero-search-fields">
          <div className="search-field">
            <span className="field-icon">⌕</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label htmlFor="serviceInput">What are you looking for?</label>
              <input
                id="serviceInput"
                type="text"
                list="serviceOptions"
                placeholder={suggestions[0]?.name ?? 'Yoga, personal training...'}
                value={service}
                onChange={(e) => setService(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') search();
                }}
              />
              {/* A datalist, not a select: the design ships a free-text field,
                  and this adds the live options without changing it. */}
              <datalist id="serviceOptions">
                {suggestions.map((s) => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="search-field">
            <span className="field-icon">⌖</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label htmlFor="locationInput">Where?</label>
              <input
                id="locationInput"
                type="text"
                placeholder="Enter your area or city"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') search();
                }}
              />
            </div>
          </div>

          <div className="search-field">
            <span className="field-icon">◷</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label htmlFor="sessionInput">Session preference</label>
              <select
                id="sessionInput"
                value={session}
                onChange={(e) => setSession(e.target.value)}
              >
                <option value="">Any session type</option>
                <option>At my home</option>
                <option>At trainer&apos;s location</option>
                <option>Online</option>
              </select>
            </div>
          </div>

          <button className="btn btn-primary" onClick={search}>
            Search <span>↗</span>
          </button>
        </div>
      </div>
    </div>
  );
}
