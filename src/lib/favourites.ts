// Saved trainers — client instruction, 13 Nov 2026; not in the v3 PDF.
//
// The heart on a result card has existed since the design arrived and only
// raised a toast saying favourites were not available. These are the calls it
// now makes.
//
// **The saved list is filtered by the same visibility rule as the search.** A
// provider who has been suspended, whose KYC lapsed, or whose last offering
// was unapproved drops off this page — the API decides that, not the page, and
// the saved row survives so reinstating them restores the list.

import { apiGetResult, apiSend } from './api';
import { tokenStore } from './auth';
import type { ProviderCard } from './providers';

export interface SavedTrainer extends ProviderCard {
  savedAt: string;
}

/** Null when signed out — the page shows its sign-in prompt, not an error. */
export async function listSaved(): Promise<SavedTrainer[] | null> {
  const token = tokenStore.access;
  if (!token) return null;

  const result = await apiGetResult<SavedTrainer[]>('/favourites', {
    token,
    revalidate: 0,
  });

  return result.ok ? (result.data ?? []) : [];
}

/** The ids, so a search result can draw its heart already filled. */
export async function savedIds(): Promise<string[]> {
  const token = tokenStore.access;
  if (!token) return [];

  const result = await apiGetResult<string[]>('/favourites/ids', {
    token,
    revalidate: 0,
  });

  return result.ok ? (result.data ?? []) : [];
}

/**
 * Toggle. Returns the new state, or `null` when the call failed so the caller
 * can put the heart back rather than lie about what was saved.
 */
export async function toggleSaved(
  instructorId: string,
  saved: boolean,
): Promise<boolean | null> {
  const token = tokenStore.access;
  if (!token) return null;

  const result = await apiSend<{ saved: boolean }>(
    `/favourites/${instructorId}`,
    saved ? 'DELETE' : 'POST',
    saved ? undefined : {},
    token,
  );

  return result.ok ? !saved : null;
}
