import Image from 'next/image';
import Link from 'next/link';

/** Logo + wordmark + tagline. Appears in the header and the footer. */
export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="HelloFit home">
      <Image
        className="brand-logo-img"
        src="/hellofit-logo.png"
        alt="HelloFit logo"
        width={43}
        height={43}
        priority
      />
      <span className="brand-copy">
        <span className="brand-word">HELLOFIT</span>
        <span className="brand-tagline">Your time, Your Place</span>
      </span>
    </Link>
  );
}
