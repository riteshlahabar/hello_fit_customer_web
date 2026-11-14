import Link from 'next/link';
import { TrainerSearch } from '@/components/trainers/TrainerSearch';
import { listFilterOptions } from '@/lib/provider-filters';
import { searchProviders, type ProviderFilters } from '@/lib/providers';
import type { Metadata } from 'next';
import './page.css';

/**
 * Converted from the demo's hellofit-find-a-trainer.html.
 * The markup and styling are the client's design; only the mechanics are React.
 */

export const metadata: Metadata = {
  title: "Find a Trainer | HelloFit",
};

/**
 * `?categoryId=` arrives from the homepage's four category cards, which until
 * 13 Nov 2026 pointed at a `#search` anchor that no page ever defined — the
 * click did nothing at all. A single id only: the filter sidebar takes several
 * but a card stands for one category, and accepting a list here would mean
 * trusting an arbitrary URL to be a set of real UUIDs.
 */
export default async function FindATrainerPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string }>;
}) {
  const { categoryId } = await searchParams;
  const initialFilters: ProviderFilters = categoryId
    ? { page: 1, categoryId: [categoryId] }
    : { page: 1 };

  // Rendered on the server so the list is never briefly empty; every change
  // after that is fetched in the browser by `TrainerSearch`.
  const [{ rows, meta, error }, { categories, cities }] = await Promise.all([
    searchProviders(initialFilters),
    listFilterOptions(),
  ]);

  return (
    <div data-hf-page="find-a-trainer">
      <main id="top"><div className="container"><div className="breadcrumb"><Link href="/">Home</Link> / <span>Find a Trainer</span></div><section className="page-hero"><div><div className="eyebrow">Your goals deserve the right guide</div><h1>Find your <em>fitness</em><br />person.</h1><p className="hero-copy">Explore fitness professionals, compare services and find a trainer whose expertise, style and schedule fit your life.</p></div><div className="hero-side"><strong>Your next step starts here.</strong><p>Choose what you want to work on and discover sample profiles in this prototype.</p><div className="mini-stats"><div><b>8</b><span>Categories</span></div><div><b>Flexible</b><span>Session options</span></div><div><b>For you</b><span>Personal fit</span></div></div></div></section><TrainerSearch initialRows={rows} initialMeta={meta} initialError={error} categories={categories} cities={cities} initialFilters={initialFilters} /><section className="container cta"><div><h2>Not sure where to start?</h2><p>Explore fitness categories and find a service that fits your goals.</p></div><Link className="btn" href="/#categories">Explore Categories ↗</Link></section></div></main><div className="toast" id="toast" role="status" aria-live="polite"></div>
    </div>
  );
}
