// Turning an API file link into one `next/image` will actually load.
//
// **The bug this fixes.** `LocalDiskStorage.publicUrl` hands out an absolute
// link built from `PUBLIC_BASE_URL` — on a developer machine
// `http://192.168.1.9:3000/api/v1/files/public/…`, because Flutter's
// `Image.network` and the admin panel's `<img>` have no page origin to resolve
// a relative path against. `next.config.ts` allows remote images from
// `{ protocol: 'https', hostname: '**' }` — **https only** — so every real
// provider photo was rejected and the card fell back to its placeholder. A
// trainer with a photo and a trainer without one looked identical.
//
// **Why rewriting beats widening the allow-list.** The file route is
// `/api/v1/files/…`, which the site already proxies to the API — a dev-mode
// `rewrites()` entry, Nginx in production. Stripping the origin makes the
// image same-origin, so `next/image` needs no remote host configured at all,
// the API host never reaches the browser, and the same code is correct on a
// LAN IP, on localhost and behind the VPS. Widening `remotePatterns` to `http`
// would instead let any plaintext host serve images into the page.
//
// Anything that is not an API file link is returned untouched: category card
// images are administered as arbitrary https URLs and must keep working.

/** The path every file the API serves sits under. */
const FILES_PATH = '/api/v1/files/';

/**
 * `http://host:3000/api/v1/files/public/x.jpg` → `/api/v1/files/public/x.jpg`.
 *
 * Returns `null` for a null or blank input so a caller can pick its own
 * placeholder, and leaves a URL it does not recognise alone.
 */
export function fileUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Already relative — nothing to strip.
  if (trimmed.startsWith('/')) return trimmed;

  const marker = trimmed.indexOf(FILES_PATH);
  if (marker === -1) return trimmed;

  return trimmed.slice(marker);
}

/**
 * Initials for the avatar that stands in for a missing photo — "Asha
 * Kulkarni" → "AK".
 *
 * The placeholder was `/hellofit-logo.png`, the company logo, on every
 * provider without a photo. On a results grid that reads as a broken image
 * repeated six times; initials read as a person whose photo is not up yet.
 */
export function initialsOf(name: string): string {
  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return '?';

  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';

  return (first + last).toUpperCase();
}
