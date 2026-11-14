// The option lists behind Find a Trainer's filters.
//
// Both are administered, not invented: categories come from Catalog →
// Categories in the admin panel, cities from Masters → Cities. The demo's
// hard-coded lists ("Personal Training", "Mumbai", …) are gone — a category
// the client adds in the panel shows up here, and one they retire disappears.
//
// Failure is not fatal. If either list cannot be loaded the page still renders
// and searches; the visitor simply gets fewer ways to narrow it. Hiding the
// whole page because a dropdown is empty would be the worse trade.

import { apiGet } from './api';
import type { FilterOption } from '@/components/trainers/TrainerFilters';

interface ApiNamed {
  id: string;
  name: string;
}

export interface FilterOptions {
  categories: FilterOption[];
  cities: FilterOption[];
}

/** Cached for five minutes — master data changes when ops edits it. */
export async function listFilterOptions(): Promise<FilterOptions> {
  const [categories, cities] = await Promise.all([
    apiGet<ApiNamed[]>('/categories'),
    apiGet<ApiNamed[]>('/serviceability/cities'),
  ]);

  return {
    categories: (categories ?? []).map(({ id, name }) => ({ id, name })),
    cities: (cities ?? []).map(({ id, name }) => ({ id, name })),
  };
}
