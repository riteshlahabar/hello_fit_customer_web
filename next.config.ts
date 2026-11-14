import type { NextConfig } from 'next';

/**
 * Where the API lives when this is running on a developer's machine.
 * Production needs none of this — see `rewrites` below.
 */
const DEV_API_ORIGIN = process.env.DEV_API_ORIGIN ?? 'http://localhost:3000';

const nextConfig: NextConfig = {
  /**
   * Build output directory, overridable.
   *
   * `next dev` and `next build` both own `.next`, so a verification build run
   * while the developer's dev server is up fights it over the same folder and
   * leaves that server serving a half-written build. Setting
   * `NEXT_DIST_DIR=.next-verify` gives the second one its own, so a smoke run
   * against a fresh API never costs anybody their running site.
   */
  distDir: process.env.NEXT_DIST_DIR ?? '.next',

  images: {
    // The demo hotlinks every photo from Unsplash. Fine for a prototype; before launch
    // these become real provider photos served from the project's own S3 + CDN.
    //
    // Category card images are now administered in the admin panel (Catalog →
    // Categories, "Card image URL") and can point anywhere, so `next/image`
    // would throw on an unconfigured host and take the homepage with it.
    // `**` keeps any https host loadable; it is the same exposure the demo
    // already accepts by hotlinking, and it is what makes the field usable
    // before the S3 + CDN work lands. Narrow this to the CDN host at launch.
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },

  /**
   * Dev-only proxy for `/api/v1/*`, the same job the admin panel's Vite proxy
   * does.
   *
   * In production the site and the API sit behind one Nginx on one VPS
   * (`state/decisions.md`), so `/api/v1` is same-origin and nothing is needed.
   * In development they are two origins — `next dev` on 3001, the API on 3000
   * — and **the API has no CORS configured**, so a browser call from the page
   * would be blocked. Proxying keeps it same-origin in both places, which
   * means no `NEXT_PUBLIC_API_BASE_URL` to set and no CORS to open up.
   */
  async rewrites() {
    if (process.env.NODE_ENV === 'production') return [];

    return [
      {
        source: '/api/v1/:path*',
        destination: `${DEV_API_ORIGIN}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
