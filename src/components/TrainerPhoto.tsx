// A provider's photo, or their initials when there is none.
//
// One component because three places draw the same thing at three sizes —
// the result card, the profile portrait and the chosen-trainer strip in the
// booking wizard — and each had its own `src={photoUrl ?? PLACEHOLDER}` with
// the company logo as the fallback. Six logos in a results grid read as six
// broken images.
//
// The URL goes through `fileUrl` so `next/image` is given a same-origin path
// rather than the API's absolute `http://…` link, which it refuses. See
// `lib/media.ts` for why that refusal is the right default to work around
// rather than to switch off.

import Image from 'next/image';
import { fileUrl, initialsOf } from '@/lib/media';

/**
 * **The optimizer is skipped for these, deliberately.**
 *
 * `fileUrl` hands `next/image` a same-origin path, which the *browser*
 * resolves correctly — but the image optimizer fetches the URL **from inside
 * the Next server**, where `/api/v1` is not served: `rewrites()` returns `[]`
 * under `NODE_ENV=production`, and in development it points at
 * `DEV_API_ORIGIN`, which defaults to port 3000 while the review VPS runs the
 * API on 4000. So `/_next/image?url=%2Fapi%2Fv1%2Ffiles%2F…` answered **404**
 * on the deployed site and no provider photo appeared, with nothing in the
 * page to suggest why.
 *
 * Unoptimized, the browser requests the file straight through Nginx, which
 * already serves it. Nothing is lost: these are uploaded JPEGs under the
 * `public/` storage prefix, which the API returns with
 * `Cache-Control: public, max-age=86400, immutable` because a replacement
 * photo gets a new UUID. Resizing them through a second hop that has to reach
 * the API would buy caching we already have, at the cost of a config no
 * deployment has got right yet.
 */
const UNOPTIMIZED = true;

export function TrainerPhoto({
  name,
  photoUrl,
  /** `fill` for a sized container; otherwise an intrinsic box. */
  fill = false,
  width,
  height,
  sizes,
  className,
}: {
  name: string;
  photoUrl: string | null | undefined;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
}) {
  const src = fileUrl(photoUrl);

  if (!src) {
    return (
      <span className={`avatar-fallback${className ? ` ${className}` : ''}`} aria-label={name}>
        <span aria-hidden="true">{initialsOf(name)}</span>
      </span>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={name}
        fill
        sizes={sizes}
        className={className}
        unoptimized={UNOPTIMIZED}
        style={{ objectFit: 'cover' }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={width ?? 400}
      height={height ?? 400}
      sizes={sizes}
      className={className}
      unoptimized={UNOPTIMIZED}
    />
  );
}
