// The homepage's featured-trainer card — the demo's `.trainer-card` markup,
// on a real provider.
//
// Until 13 Nov 2026 (Phase 5) this rendered one of three invented people from
// `src/data/home.ts` — "Alex Morgan", 4.9, ₹900 — whose heart toasted
// "Saved to your favourites (demo)." and whose "View profile ↗" toasted
// "Trainer profile page is part of the next design stage." Both are real now:
// the heart is the same `SaveHeart` the search results use, and the button
// goes to `/trainer-profile?id=`, which exists.
//
// A *separate* component from `trainers/ProviderResultCard` on purpose: the
// homepage card is the demo's `.trainer-card` inside the `#trainers` band,
// with its own `.trainer-image` / `.trainer-info` shape and its own page
// scope, while the result card is the search page's. Both read the same
// `ProviderCard` from the same endpoint, so the *values* cannot drift; only
// the markup differs, which is what the two designs ask for.

import Image from 'next/image';
import Link from 'next/link';
import { SESSION_LABELS, type ProviderCard } from '@/lib/providers';
import { SaveHeart } from './trainers/SaveHeart';

const PLACEHOLDER = '/hellofit-logo.png';

export function TrainerCard({ trainer }: { trainer: ProviderCard }) {
  const category = trainer.categories[0]?.name;
  const role =
    trainer.specialisations[0] ??
    category ??
    SESSION_LABELS[trainer.sessionFormats[0]] ??
    'Fitness trainer';

  return (
    <article className="trainer-card">
      <div className="trainer-image">
        <Image
          src={trainer.photoUrl ?? PLACEHOLDER}
          alt={trainer.name}
          fill
          sizes="(max-width:950px) 100vw, 33vw"
        />
        {category ? <span className="tag">{category.toUpperCase()}</span> : null}
        <SaveHeart instructorId={trainer.id} name={trainer.name} next="/" />
      </div>

      <div className="trainer-info">
        <div className="trainer-top">
          <div>
            <h3>{trainer.name}</h3>
            <div className="trainer-role">{role}</div>
          </div>
          {/* No rating line at all until someone has reviewed them. "★ 0.0"
              reads as a bad trainer rather than a new one. */}
          {trainer.ratingCount > 0 ? (
            <div className="trainer-rating">
              <span>★</span> {trainer.rating.toFixed(1)}{' '}
              <small>({trainer.ratingCount})</small>
            </div>
          ) : null}
        </div>

        <div className="trainer-meta">
          <div className="price">
            {trainer.fromPrice === null ? (
              <small>Price on request</small>
            ) : (
              <>
                ₹{Math.round(trainer.fromPrice).toLocaleString('en-IN')}{' '}
                <small>/ session</small>
              </>
            )}
          </div>
          <Link className="btn btn-dark" href={`/trainer-profile?id=${trainer.id}`}>
            View profile ↗
          </Link>
        </div>
      </div>
    </article>
  );
}
