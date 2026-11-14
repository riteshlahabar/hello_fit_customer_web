import type { Metadata } from 'next';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { ToastProvider } from '@/components/Toast';
import './globals.css';
import './(site)/site.css';

export const metadata: Metadata = {
  title: 'HelloFit — Your time, Your Place',
  description:
    'Find fitness professionals for personal training, yoga, pilates and mobility. Book sessions that fit your goals, your routine and your space.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/*
          Fonts are loaded the way the demo loads them, because globals.css is the demo's
          stylesheet verbatim and refers to the families by name ('Anton', 'Poppins').
          Moving to next/font would mean rewriting every font-family rule in that file —
          worth doing once the design is signed off, not before.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- the rule targets the
            pages router; in the app router this <head> is the root layout, so the font
            loads site-wide, not per page. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ToastProvider>
          {/*
            One header and one footer on every page, signed in or not — client
            instruction, 13 Nov 2026. They replace 13 hand-written headers and 15
            inline footers that no two pages agreed on.

            **They are siblings of the page, never its parent.** Each converted
            page's CSS is scoped to its own `[data-hf-page="<slug>"]` because the
            demo redefines `.btn`, `.brand`, `.card` and even `h1` differently per
            page (see globals.css). Wrapping the page in the home scope to style
            the header would leak all 271 of home's rules into every other page —
            `[data-hf-page="home"] h1` would restyle every heading on Billing.
            As siblings, each scope styles only its own subtree.
          */}
          <div data-hf-page="home" data-hf-shell>
            <div className="announcement">
              MOVE BETTER. FEEL STRONGER. <strong>YOUR FITNESS, YOUR WAY.</strong>
            </div>
            <Header />
          </div>

          {children}

          <div data-hf-page="home" data-hf-shell>
            <Footer />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
