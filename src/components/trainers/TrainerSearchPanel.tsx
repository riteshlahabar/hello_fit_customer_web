'use client';

// The wide search bar above the results — the demo's `.search-panel`.
//
// It writes into the same filter state as the sidebar rather than keeping its
// own: in the demo the two were separate controls that could disagree, and a
// city chosen up here while the sidebar still said "All locations" is a bug
// waiting to be reported.
//
// Its "Search Trainers" button submits the form. The list already updates as
// the visitor types (debounced in `TrainerSearch`), so the button is there for
// the people who expect to press something — it is not a no-op, it just has
// nothing left to do by the time it is clicked.

import type { ProviderFilters } from '@/lib/providers';
import type { FilterOption } from './TrainerFilters';

interface Props {
  filters: ProviderFilters;
  categories: FilterOption[];
  cities: FilterOption[];
  onChange: (next: ProviderFilters) => void;
}

export function TrainerSearchPanel({ filters, categories, cities, onChange }: Props) {
  return (
    <form
      className="search-panel"
      aria-label="Search trainers"
      onSubmit={(e) => e.preventDefault()}
    >
      <label className="field">
        <span className="sym">⌕</span>
        <input
          placeholder="Trainer name, skill or service"
          value={filters.q ?? ''}
          onChange={(e) => onChange({ ...filters, q: e.target.value, page: 1 })}
        />
      </label>

      <label className="field">
        <span className="sym">⌖</span>
        <select
          aria-label="City"
          value={filters.cityId ?? ''}
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
      </label>

      <label className="field">
        <span className="sym">✳</span>
        <select
          aria-label="Category"
          // The sidebar allows several categories; this picker is one. It shows
          // the single selection and clears the rest, which is what someone
          // choosing from a one-value dropdown expects.
          value={filters.categoryId?.length === 1 ? filters.categoryId[0] : ''}
          onChange={(e) =>
            onChange({
              ...filters,
              categoryId: e.target.value ? [e.target.value] : undefined,
              page: 1,
            })
          }
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <button className="btn primary" type="submit">
        Search Trainers ↗
      </button>
    </form>
  );
}
