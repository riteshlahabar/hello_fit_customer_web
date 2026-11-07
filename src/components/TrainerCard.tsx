'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Trainer } from '@/data/home';
import { useToast } from './Toast';

export function TrainerCard({ trainer }: { trainer: Trainer }) {
  const [saved, setSaved] = useState(false);
  const showToast = useToast();

  function toggleHeart() {
    const next = !saved;
    setSaved(next);
    showToast(
      next ? 'Saved to your favourites (demo).' : 'Removed from favourites (demo).',
    );
  }

  return (
    <article className="trainer-card">
      <div className="trainer-image">
        <Image src={trainer.image} alt={trainer.alt} fill sizes="(max-width:950px) 100vw, 33vw" />
        <span className="tag">{trainer.tag}</span>
        <button
          className="heart"
          aria-label={saved ? 'Remove from saved trainers' : 'Save trainer'}
          aria-pressed={saved}
          style={{ color: saved ? '#E33E29' : '#161614' }}
          onClick={toggleHeart}
        >
          {saved ? '♥' : '♡'}
        </button>
      </div>

      <div className="trainer-info">
        <div className="trainer-top">
          <div>
            <h3>{trainer.name}</h3>
            <div className="trainer-role">{trainer.role}</div>
          </div>
          <div className="trainer-rating">
            <span>★</span> {trainer.rating} <small>(sample)</small>
          </div>
        </div>

        <div className="trainer-meta">
          <div className="price">
            {trainer.price} <small>/ session*</small>
          </div>
          <button
            className="btn btn-dark"
            onClick={() =>
              showToast('Trainer profile page is part of the next design stage.')
            }
          >
            View profile ↗
          </button>
        </div>
      </div>
    </article>
  );
}
