import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // The demo hotlinks every photo from Unsplash. Fine for a prototype; before launch
    // these become real provider photos served from the project's own S3 + CDN.
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
};

export default nextConfig;
