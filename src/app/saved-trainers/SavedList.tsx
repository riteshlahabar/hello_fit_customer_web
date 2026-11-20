'use client';

// The saved trainers grid, in the client's own card markup.
//
// The demo built these cards in an inline script from a `trainers` array, so
// the conversion left `<div class="grid" id="grid">` empty and the page has
// shown nothing since. This is that template — `.trainer`, `.photo`,
// `.portrait`, `.body`, `.bottom`, `.card-actions` — rendered from
// `GET /favourites`. The page's own stylesheet needs those class names, which
// is why the richer `ProviderResultCard` is not reused here: it belongs to
// Find a Trainer's scope and would arrive unstyled.
//
// Three honest departures from the demo's card:
//
//   * **"Details" is gone.** It opened a modal of invented copy. The trainer
//     profile is a real page and the name links to it.
//   * **No emoji portrait.** The API has a photo URL or nothing; the initial
//     stands in. Picking an emoji per trainer would be inventing a field.
//   * **No "● Available for booking".** Availability is a slot-grid question
//     and this endpoint does not answer it. Claiming it would be a guess the
//     customer acts on.

import { useState } from 'react';
import Link from 'next/link';
import type { SavedTrainer } from '@/lib/favourites';
import { SaveHeart } from '@/components/trainers/SaveHeart';

const rupees = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

const initial = (name: string) => name.trim().charAt(0).toUpperCase() || '♡';

export function SavedList({
  initialRows,
  signedIn,
}: {
  initialRows: SavedTrainer[];
  signedIn: boolean;
}) {
  const [rows, setRows] = useState(initialRows);

  if (!signedIn) {
    return (
      <div className="empty">
        <div className="big">♡</div>
        <h3>Sign in to see your saved trainers</h3>
        <p>Your shortlist is kept with your account.</p>
        <Link className="btn primary" href="/login?next=%2Fsaved-trainers">
          Log in
        </Link>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="empty">
        <div className="big">♡</div>
        <h3>Your shortlist is waiting</h3>
        <p>Save a trainer from the search and they will appear here.</p>
        <Link className="btn primary" href="/find-a-trainer">
          Find your trainer
        </Link>
      </div>
    );
  }

  return (
    <div className="grid" id="grid">
      {rows.map((trainer) => (
        <article className="trainer" key={trainer.id}>
          <div className="photo">
            <SaveHeart
              instructorId={trainer.id}
              name={trainer.name}
              initiallySaved
              // Un-saving on this page should take the card away; leaving it
              // sitting there with a hollow heart reads as a failed action.
              onChange={(saved) =>
                setRows((current) =>
                  saved ? current : current.filter((row) => row.id !== trainer.id),
                )
              }
            />
            <div className="portrait">{initial(trainer.name)}</div>
          </div>

          <div className="body">
            <div className="row">
              <h2 className="name">
                <Link href={`/trainer-profile?id=${trainer.id}`}>{trainer.name}</Link>
              </h2>
              <span className="verified">✓ Verified</span>
            </div>

            <div className="meta">
              {trainer.categories[0]?.name ?? 'Fitness professional'}
              {trainer.experienceYears ? ` · ${trainer.experienceYears} years` : ''}
            </div>

            {trainer.ratingCount > 0 ? (
              <div className="rating">
                <span>★</span> {trainer.rating.toFixed(1)}{' '}
                <span style={{ color: '#928b83', fontWeight: 500 }}>
                  ({trainer.ratingCount} reviews)
                </span>
              </div>
            ) : (
              <div className="meta">No reviews yet</div>
            )}

            {trainer.headline ? (
              <p
                style={{
                  color: '#6f6962',
                  lineHeight: 1.65,
                  fontSize: '12px',
                  margin: '0 0 14px',
                }}
              >
                {trainer.headline}
              </p>
            ) : null}

            <div className="bottom">
              <div>
                <div className="price">
                  {trainer.fromPrice === null ? (
                    'Price on request'
                  ) : (
                    <>
                      {rupees(trainer.fromPrice)} <small>/ session</small>
                    </>
                  )}
                </div>
                <div className="meta">From</div>
              </div>
              <div className="card-actions">
                <Link className="btn primary" href={`/booking?trainer=${trainer.id}`}>
                  Book now
                </Link>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
