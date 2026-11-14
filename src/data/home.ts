/**
 * Homepage content, lifted from the client demo's hardcoded markup.
 *
 * What is left here is **design copy with no field behind it** — the trust
 * strip, the about points, the How-it-works steps, the testimonials. It is the
 * client's approved wording, not stand-in data.
 *
 * The two arrays that *were* stand-in data have gone live: categories read
 * `GET /categories` through `lib/catalog.ts` (this file's `categories` is now
 * only the fallback when the API is unreachable), and the three invented
 * trainers were deleted on 13 Nov 2026 for `topProviders()` — see below.
 */

export type TrustItem = { icon: string; title: string; sub: string };

export const trustItems: TrustItem[] = [
  { icon: '◎', title: 'Made for your routine', sub: 'Fitness around your schedule' },
  { icon: '⌖', title: 'Your place, your pace', sub: 'Find options that fit your life' },
  { icon: '✳', title: 'Different ways to move', sub: 'Explore your fitness interests' },
  { icon: '♡', title: 'People-first experience', sub: 'Choose what feels right for you' },
];

export type AboutPoint = { icon: string; label: string };

export const aboutPoints: AboutPoint[] = [
  { icon: '✓', label: 'Options for different goals' },
  { icon: '⌖', label: 'Flexible session locations' },
  { icon: '◷', label: 'Scheduling around your day' },
  { icon: '♡', label: 'A more personal fitness journey' },
];

export type Category = {
  /** The real category id when the API supplied it. Absent on the static
   * fallback array, which has no ids — the card then links to the unfiltered
   * search rather than inventing a `categoryId` the API would reject. */
  id?: string;
  number: string;
  title: string;
  blurb: string;
  image: string;
  alt: string;
};

export const categories: Category[] = [
  {
    number: '01 / STRENGTH',
    title: 'Personal Training',
    blurb: 'Build strength with expert guidance',
    image:
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=700&q=80',
    alt: 'Personal training',
  },
  {
    number: '02 / BALANCE',
    title: 'Yoga',
    blurb: 'Find balance in body and mind',
    image:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=700&q=80',
    alt: 'Yoga practice',
  },
  {
    number: '03 / CONTROL',
    title: 'Pilates & Mobility',
    blurb: 'Move with control and confidence',
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=700&q=80',
    alt: 'Pilates and mobility',
  },
  {
    number: '04 / ENERGY',
    title: 'Functional Fitness',
    blurb: 'Make everyday movement stronger',
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=700&q=80',
    alt: 'Functional fitness',
  },
];

/**
 * The three invented trainers that stood here — "Alex Morgan" 4.9 ₹900,
 * "Maya Sharma", "Rohan Mehta" — were DELETED on 13 Nov 2026 (Phase 5), not
 * left unused. The homepage band now reads `topProviders()`; a fake person
 * with a Book button left in the repo is the one that gets re-imported by
 * mistake. `ProviderCard` from `lib/providers.ts` is the shape now.
 */

export type Step = { no: string; title: string; body: string };

export const steps: Step[] = [
  {
    no: '01',
    title: 'Tell us what moves you',
    body: 'Explore fitness categories and look for the service that matches your goals.',
  },
  {
    no: '02',
    title: 'Choose your professional',
    body: 'Compare profiles, services, prices, and availability to find a good fit.',
  },
  {
    no: '03',
    title: 'Book a time that works',
    body: 'Select your session details and follow the booking and payment steps.',
  },
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  image: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      'Finding a yoga instructor who could work around my schedule felt so much easier. I love being able to explore options that fit my routine.',
    name: 'Priya S.',
    role: 'Yoga session customer',
    image:
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=120&q=80',
  },
  {
    quote:
      'The experience feels straightforward. I can compare trainer profiles, understand the session options, and decide what works best for me.',
    name: 'Rohit M.',
    role: 'Personal training customer',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
  },
  {
    quote:
      'I wanted a fitness routine that suited my goals and lifestyle. HelloFit’s approach makes taking that first step feel less complicated.',
    name: 'Anjali K.',
    role: 'Fitness services customer',
    image:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
  },
];

/** The three faces in the hero's social-proof stack. */
export const heroAvatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=80&q=80',
];

/** Tabs above the hero search panel. An empty `service` means "All services". */
export const searchTabs = [
  { label: 'All services', service: '' },
  { label: 'Personal Training', service: 'Personal Training' },
  { label: 'Yoga', service: 'Yoga' },
  { label: 'Pilates', service: 'Pilates' },
  { label: 'Mobility', service: 'Mobility & Flexibility' },
  { label: 'Functional Fitness', service: 'Functional Fitness' },
];
