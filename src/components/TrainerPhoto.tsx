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
    />
  );
}
