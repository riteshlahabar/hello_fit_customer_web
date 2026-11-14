'use client';

// The design's filter sidebar, with its invented option lists replaced by the
// administered ones.
//
// The demo hard-coded five categories ("Personal Training", "Strength
// Training"…) and four cities. Both are master data an administrator owns —
// Catalog → Categories and Masters → Cities — so they are fetched. A category
// the client adds in the panel appears here; one they retire disappears. That
// is the whole point of the admin panel being the control surface.
//
// The price slider keeps the demo's ₹500–₹1500 range. It is presentation, not
// policy: `maxPrice` is only sent when the visitor moves it off the maximum,
// so a provider priced above ₹1500 is never hidden by a filter nobody touched.

import { SESSION_LABELS, SESSION_ORDER, type ProviderFilters } from '@/lib/providers';

export interface FilterOption {
  id: string;
  name: string;
}

const PRICE_MIN = 500;
const PRICE_MAX = 1500;
const RATINGS = [0, 4, 4.5, 4.8];

interface Props {
  filters: ProviderFilters;
  categories: FilterOption[];
  cities: FilterOption[];
  onChange: (next: ProviderFilters) => void;
  onReset: () => void;
}

export function TrainerFilters({ filters, categories, cities, onChange, onReset }: Props) {
  const toggleCategory = (id: string) => {
    const current = filters.categoryId ?? [];
    onChange({
      ...filters,
      categoryId: current.includes(id)
        ? current.filter((c) => c !== id)
        : [...current, id],
      page: 1,
    });
  };

  const toggleFormat = (format: (typeof SESSION_ORDER)[number]) => {
    const current = filters.sessionFormat ?? [];
    onChange({
      ...filters,
      sessionFormat: current.includes(format)
        ? current.filter((f) => f !== format)
        : [...current, format],
      page: 1,
    });
  };

  return (
    <aside className="filters-panel" id="filters">
      <div className="filters-top">
        <h2>Filter trainers</h2>
        <button className="reset" onClick={onReset} type="button">
          Reset all
        </button>
      </div>

      {categories.length > 0 && (
        <div className="filter-group">
          <h3>Fitness category</h3>
          {categories.map((category) => (
            <label className="checkline" key={category.id}>
              <input
                type="checkbox"
                checked={(filters.categoryId ?? []).includes(category.id)}
                onChange={() => toggleCategory(category.id)}
              />{' '}
              {category.name}
            </label>
          ))}
        </div>
      )}

      {cities.length > 0 && (
        <div className="filter-group">
          <h3>City</h3>
          <select
            value={filters.cityId ?? ''}
            aria-label="Filter by city"
            onChange={(e) =>
              onChange({ ...filters, cityId: e.target.value || undefined, page: 1 })
            }
          >
            <option value="">All locations</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="filter-group">
        <h3>Session location</h3>
        {SESSION_ORDER.map((format) => (
          <label className="checkline" key={format}>
            <input
              type="checkbox"
              checked={(filters.sessionFormat ?? []).includes(format)}
              onChange={() => toggleFormat(format)}
            />{' '}
            {SESSION_LABELS[format]}
          </label>
        ))}
      </div>

      <div className="filter-group">
        <h3>Price per session</h3>
        <input
          className="price-range"
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={50}
          aria-label="Maximum price per session"
          value={filters.maxPrice ?? PRICE_MAX}
          onChange={(e) => {
            const value = Number(e.target.value);
            onChange({
              ...filters,
              // At the top of the range the visitor has set no ceiling.
              maxPrice: value >= PRICE_MAX ? undefined : value,
              page: 1,
            });
          }}
        />
        <div className="price-labels">
          <span>₹{PRICE_MIN}</span>
          <strong>
            {filters.maxPrice ? `Up to ₹${filters.maxPrice}` : 'Any price'}
          </strong>
        </div>
      </div>

      <div className="filter-group">
        <h3>Minimum rating</h3>
        <div className="rating-filter">
          {RATINGS.map((rating) => (
            <button
              key={rating}
              type="button"
              className={(filters.minRating ?? 0) === rating ? 'active' : undefined}
              onClick={() => onChange({ ...filters, minRating: rating, page: 1 })}
            >
              {rating === 0 ? 'Any' : `★ ${rating.toFixed(1)}+`}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
