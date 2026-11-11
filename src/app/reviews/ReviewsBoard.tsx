'use client';

// The live Reviews & Ratings page (PDF §5.10). Everything here was sample
// content in the demo: the 4.9 / 128-review scorecard, four named trainers in
// the selects, and a review list its script generated.
//
// The card classes (`.review`, `.reviewhead`, `.reviewstars`, …) are the
// client's own stylesheet — the demo left `#reviews` empty for its script to
// fill, so the cards are built from the classes the design already defines.
//
// **One control the demo did not draw.** The API requires a score for every
// mandatory criterion (`punctuality` and `knowledge` are seeded mandatory), so
// a review with only an overall rating is refused with 400. Those rows are
// rendered with the design's own `.rating-input` control. The alternative was
// to copy the overall rating into each criterion, which would put scores the
// customer never gave into the provider's rating — worth flagging to the
// client, not worth faking.

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadReviews, ratingSummary, submitReview } from '@/lib/reviews';
import type { Criterion, MyReview, PendingSession } from '@/lib/reviews';
import { formatBookingDate } from '@/data/bookings';

const STARS = [1, 2, 3, 4, 5];

/** The design's star row: five buttons, `on` for the chosen ones. */
function StarPicker({ value, onPick, label }: { value: number; onPick: (n: number) => void; label: string }) {
  return (
    <div className="rating-input" aria-label={label}>
      {STARS.map((n) => (
        <button
          key={n}
          type="button"
          data-rating={n}
          className={n <= value ? 'on' : ''}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
          onClick={() => onPick(n)}
        >
          ★
        </button>
      ))}
    </div>
  );
}

const starString = (n: number) => '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);

const initialsOf = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '—';

export function ReviewsBoard() {
  const router = useRouter();
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [pending, setPending] = useState<PendingSession[]>([]);
  const [mine, setMine] = useState<MyReview[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The form.
  const [trainer, setTrainer] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [rating, setRating] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // The list.
  const [trainerFilter, setTrainerFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sort, setSort] = useState('newest');

  async function refresh(first = false) {
    const result = await loadReviews();

    if (result.unauthorised) {
      router.replace('/login');
      return;
    }

    setError(result.error ?? null);
    setCriteria(result.criteria);
    setPending(result.pending);
    setMine(result.mine);
    if (first) setReady(true);
  }

  useEffect(() => {
    // Wrapped rather than called directly: `refresh` reads `loadReviews`
    // first, so every setState inside it lands after an await — which is what
    // keeps this out of the synchronous-setState-in-effect trap.
    const run = async () => {
      await refresh(true);
    };

    void run();
    // `refresh` closes over nothing that changes between renders but the
    // router, which is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Trainers the customer actually has an unreviewed session with. */
  const trainers = useMemo(
    () => Array.from(new Set(pending.map((p) => p.trainer))).sort(),
    [pending],
  );

  const sessions = useMemo(
    () => pending.filter((p) => !trainer || p.trainer === trainer),
    [pending, trainer],
  );

  const summary = ratingSummary(mine);

  const shown = useMemo(() => {
    const rows = mine.filter(
      (r) =>
        (trainerFilter === 'all' || r.trainer === trainerFilter) &&
        (ratingFilter === 'all' || r.rating === Number(ratingFilter)),
    );

    if (sort === 'highest') return [...rows].sort((a, b) => b.rating - a.rating);
    if (sort === 'lowest') return [...rows].sort((a, b) => a.rating - b.rating);
    return rows; // The API returns newest first.
  }, [mine, trainerFilter, ratingFilter, sort]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!sessionId) return setNotice('Choose the session you are reviewing.');
    if (rating === 0) return setNotice('Select 1–5 stars.');

    setSending(true);
    const result = await submitReview({ sessionId, overallRating: rating, headline, body, criteria: scores });
    setSending(false);

    setNotice(result.message ?? null);

    if (result.ok) {
      setSessionId('');
      setTrainer('');
      setRating(0);
      setScores({});
      setHeadline('');
      setBody('');
      await refresh();
    }
  }

  return (
    <>
      <section className="overview">
        <div className="scorecard">
          <div className="scorelabel">RATINGS YOU HAVE GIVEN</div>
          <div className="scoreline">
            <div className="score">{summary.total === 0 ? '—' : summary.average.toFixed(1)}</div>
            <div>
              <div className="stars">{starString(Math.round(summary.average))}</div>
              <div className="scoremeta">
                {summary.total === 0
                  ? 'No reviews yet'
                  : `Average rating · ${summary.total} review${summary.total === 1 ? '' : 's'}`}
              </div>
            </div>
          </div>
          <div className="bars">
            {summary.bars.map((bar) => (
              <div className="barrow" key={bar.star}>
                <span>{bar.star}★</span>
                <div className="bar"><span style={{ width: `${bar.percent}%` }}></span></div>
                <span>{bar.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="writecard" id="writeCard">
          <h2>How was your session?</h2>
          <p>Tell us what worked well and what could be better. Only sessions you have completed can be reviewed.</p>

          {ready && pending.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>
              You have no sessions waiting for a review. Once a session is completed it will appear here.
            </p>
          ) : (
            <form className="writeform" id="reviewForm" onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="trainerSelect">Trainer</label>
                <select
                  id="trainerSelect"
                  value={trainer}
                  onChange={(e) => { setTrainer(e.target.value); setSessionId(''); }}
                >
                  <option value="">All trainers</option>
                  {trainers.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="sessionSelect">Session</label>
                <select id="sessionSelect" required={true} value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
                  <option value="">Choose session</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.service} · {formatBookingDate(s.sessionDate)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field full">
                <label>Your rating</label>
                <StarPicker value={rating} onPick={setRating} label="Choose a rating" />
                <span className="rating-help" id="ratingHelp">
                  {rating === 0 ? 'Select 1–5 stars' : `${rating} of 5`}
                </span>
              </div>

              {criteria.map((criterion) => (
                <div className="field full" key={criterion.slug}>
                  <label>{criterion.name}{criterion.isMandatory ? ' *' : ''}</label>
                  <StarPicker
                    value={scores[criterion.slug] ?? 0}
                    onPick={(n) => setScores((current) => ({ ...current, [criterion.slug]: n }))}
                    label={criterion.name}
                  />
                </div>
              ))}

              <div className="field full">
                <label htmlFor="reviewTitle">Review headline</label>
                <input id="reviewTitle" maxLength={70} placeholder="e.g. A wonderful, motivating session"
                  value={headline} onChange={(e) => setHeadline(e.target.value)} />
              </div>
              <div className="field full">
                <label htmlFor="reviewText">Your review</label>
                <textarea id="reviewText" maxLength={700} required={true}
                  placeholder="Share details about the trainer, session, communication or progress..."
                  value={body} onChange={(e) => setBody(e.target.value)}></textarea>
              </div>
              <div className="submitrow">
                <small>{notice ?? 'By submitting, you confirm this reflects your genuine experience.'}</small>
                <button className="btn primary" type="submit" disabled={sending}>
                  {sending ? 'Submitting…' : 'Submit review →'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <section>
        <div className="toolbar">
          <h2>Your reviews</h2>
          <div className="filters">
            <select aria-label="Filter reviews by trainer" value={trainerFilter} onChange={(e) => setTrainerFilter(e.target.value)}>
              <option value="all">All trainers</option>
              {Array.from(new Set(mine.map((r) => r.trainer))).sort().map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <select aria-label="Filter by rating" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
              <option value="all">All ratings</option>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n === 1 ? '' : 's'}</option>)}
            </select>
            <select aria-label="Sort reviews" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="highest">Highest rated</option>
              <option value="lowest">Lowest rated</option>
            </select>
          </div>
        </div>

        <div className="reviews" id="reviews">
          {shown.map((review) => (
            <article className="review" key={review.id}>
              <div className="reviewhead">
                <div className="reviewavatar">{initialsOf(review.trainer)}</div>
                <div className="reviewwho">
                  <strong>{review.trainer}</strong>
                  <small>{review.service} · {review.date ? formatBookingDate(review.date) : 'Session'}</small>
                </div>
              </div>
              <div className="reviewstars">{starString(review.rating)}</div>
              {review.headline && <div className="reviewtitle">{review.headline}</div>}
              <p className="reviewtext">{review.body}</p>
              {review.reply && (
                <p className="reviewtext" style={{ marginTop: '10px' }}>
                  <strong>Trainer replied:</strong> {review.reply}
                </p>
              )}
              <div className="reviewfoot">
                <span>{review.published ? 'Published' : 'Awaiting publication'}</span>
                <span>{review.state}</span>
              </div>
            </article>
          ))}
        </div>

        {!ready && !error && <div className="empty">Loading your reviews…</div>}
        {error && <div className="empty">{error}</div>}
        {ready && shown.length === 0 && (
          <div className="empty" id="empty">
            {mine.length === 0
              ? 'You have not written a review yet.'
              : 'No reviews match these filters. Try another option.'}
          </div>
        )}
      </section>
    </>
  );
}
