// Live catalog for the home page, in the shapes `src/data/home.ts` already
// defines — so the JSX that renders them does not change at all.
//
// **The design is the contract here.** The static `categories` array stays in
// the repo and is what the page falls back to; the API supplies the name,
// blurb and image when it is reachable, and the card's kicker ("01 / STRENGTH")
// is still composed locally because it is a presentation device the API has no
// column for.
//
// `imageUrl` comes from the API and is administered in the panel (Catalog →
// Categories, "Card image URL"), per the client's instruction of 11 Nov 2026.
// Where a category has none, the matching static image is used, matched on
// slug — a card with no picture would break the grid.

import { apiGet } from './api';
import { categories as staticCategories, type Category } from '@/data/home';

/** The shape `GET /categories` returns. */
export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  imageUrl: string | null;
  description: string | null;
  _count?: { services: number };
}

/** The shape `GET /services` returns. */
export interface ApiService {
  id: string;
  name: string;
  slug: string;
  durationMin: number;
  basePrice: string;
  level: string;
  category?: { id: string; name: string; slug: string };
}

/**
 * The kicker's second half, by slug — "01 / **STRENGTH**".
 *
 * Kept as a lookup rather than derived from the name: "Personal Training"
 * does not shorten to "STRENGTH" by any rule, and the demo's wording is part
 * of the approved design. A category the API adds later and this does not know
 * falls back to the service count, which always reads sensibly.
 */
const KICKERS: Record<string, string> = {
  'personal-training': 'STRENGTH',
  yoga: 'BALANCE',
  zumba: 'ENERGY',
  pilates: 'CONTROL',
  meditation: 'CALM',
  'strength-training': 'POWER',
};

/** Static images and alt text, by slug, for categories the API has none for. */
const FALLBACK_IMAGES = new Map(
  staticCategories.map((category) => [
    category.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    { image: category.image, alt: category.alt },
  ]),
);

/**
 * How many cards the home grid shows.
 *
 * **Four, because the design is four.** `site.css:73` sets
 * `grid-template-columns: repeat(4, 1fr)` and the approved demo ships exactly
 * four cards, so the grid is one row by design. The seeded database has eight
 * active categories; rendering them all turns one row into two and changes
 * the page the client approved.
 *
 * Which four is the administrator's call — they are taken in `sortOrder`,
 * which is already an editable field on Catalog → Categories.
 */
const HOME_GRID_CARDS = 4;

function toCategory(row: ApiCategory, index: number): Category {
  const fallback = FALLBACK_IMAGES.get(row.slug);
  const services = row._count?.services ?? 0;

  const kicker =
    KICKERS[row.slug] ??
    (services > 0 ? `${services} SERVICE${services === 1 ? '' : 'S'}` : 'EXPLORE');

  return {
    id: row.id,
    number: `${String(index + 1).padStart(2, '0')} / ${kicker}`,
    title: row.name,
    blurb: row.description ?? 'Find the professional who fits your goals',
    // The API wins when it has an image, then the design's own image for this
    // slug. An empty string means "still needs one" and is filled by
    // `fillMissingImages` below, which is the only way to guarantee four
    // *different* photos.
    image: row.imageUrl ?? fallback?.image ?? '',
    alt: fallback?.alt ?? row.name,
  };
}

/**
 * Gives every card without an image one of the design's, **never reusing a
 * photo already on the grid**.
 *
 * A plain `index % length` cycle is not enough: a slug-matched card and a
 * cycled card can land on the same photo (Yoga matched by slug, Power Yoga by
 * position, both the yoga photo). Two identical cards side by side is exactly
 * the kind of change "keep the design the same" rules out.
 */
function fillMissingImages(cards: Category[]): Category[] {
  const taken = new Set(cards.map((card) => card.image).filter(Boolean));
  const spare = staticCategories
    .map((category) => category.image)
    .filter((image) => !taken.has(image));

  return cards.map((card) => {
    if (card.image) return card;

    // Falls back to the first design image only if the grid somehow has more
    // cards than the design has photos.
    const image = spare.shift() ?? staticCategories[0].image;
    return { ...card, image };
  });
}

/**
 * The home grid's categories. Falls back to the static array whenever the API
 * is unreachable or has none — the homepage renders either way.
 */
export async function getCategories(): Promise<Category[]> {
  const rows = await apiGet<ApiCategory[]>('/categories');

  if (!rows || rows.length === 0) return staticCategories;

  return fillMissingImages(rows.slice(0, HOME_GRID_CARDS).map(toCategory));
}

/**
 * Categories as the API gives them, **not** mapped into home-grid cards.
 *
 * `getCategories()` above returns the grid's view model — number, title,
 * blurb, image — and caps it at four, because that is what the design's
 * `repeat(4,1fr)` row holds. The hero search tabs need something different:
 * the real id to filter services by, the real name, and **all** of them.
 *
 * PDF 6.5 makes this an acceptance criterion rather than a nicety: "Active
 * categories appear on customer-facing platforms." Deriving the tabs from the
 * services instead would silently hide a category an administrator had just
 * created and activated but not yet had a service published under.
 */
export async function getApiCategories(): Promise<ApiCategory[]> {
  return (await apiGet<ApiCategory[]>('/categories')) ?? [];
}

/** Services, for the search and category pages. Empty array on failure. */
export async function getServices(categoryId?: string): Promise<ApiService[]> {
  const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
  return (await apiGet<ApiService[]>(`/services${query}`)) ?? [];
}
