'use client';

import { useState } from 'react';
import { searchTabs } from '@/data/home';
import { useToast } from './Toast';

/**
 * Hero search panel: service tabs plus the three fields.
 *
 * Picking a tab fills the service field, exactly as the demo did. Submitting shows a toast
 * preview of the query — this is where `GET /catalog/services` + the provider search
 * endpoint land once the API is wired.
 */
export function HeroSearch() {
  const [activeTab, setActiveTab] = useState(0);
  const [service, setService] = useState('');
  const [location, setLocation] = useState('');
  const [session, setSession] = useState('');
  const showToast = useToast();

  function search() {
    const parts: string[] = [];
    if (service.trim()) parts.push(service.trim());
    if (location.trim()) parts.push(`near ${location.trim()}`);
    if (session) parts.push(session.toLowerCase());

    showToast(
      parts.length
        ? `Search preview: ${parts.join(' · ')}. Search results page will be built next.`
        : 'Choose a service or location to start your search.',
    );
  }

  return (
    <div className="container hero-search-wrap">
      <div className="hero-search-panel" id="search">
        <div className="search-tabs" role="tablist" aria-label="Fitness service">
          {searchTabs.map((tab, index) => (
            <button
              key={tab.label}
              className={index === activeTab ? 'search-tab active' : 'search-tab'}
              type="button"
              role="tab"
              aria-selected={index === activeTab}
              onClick={() => {
                setActiveTab(index);
                setService(tab.service);
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
                placeholder="Yoga, personal training..."
                value={service}
                onChange={(e) => setService(e.target.value)}
              />
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
