'use client';

// Loads the saved trainers, then hands them to `SavedList`.
//
// Client-side because the access token lives in `localStorage` — the server
// cannot know who is asking, which is why every token-gated page on this site
// fetches on mount. Same shape as `NoticeList`: an async effect with a
// cancelled flag, not a synchronous setState.
//
// Signed out is a **state, not an error**. The page says so and offers a log
// in, rather than redirecting someone who may have arrived from the footer.

import { useEffect, useState } from 'react';
import { listSaved, type SavedTrainer } from '@/lib/favourites';
import { SavedList } from './SavedList';

export function SavedBoard() {
  const [rows, setRows] = useState<SavedTrainer[] | null>(null);
  const [signedIn, setSignedIn] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const saved = await listSaved();
      if (cancelled) return;

      // `null` means no token at all, as opposed to an empty list.
      setSignedIn(saved !== null);
      setRows(saved ?? []);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (rows === null) {
    return (
      <div className="empty">
        <div className="big">♡</div>
        <h3>Loading your saved trainers…</h3>
      </div>
    );
  }

  return <SavedList initialRows={rows} signedIn={signedIn} />;
}
