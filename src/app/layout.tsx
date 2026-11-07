import type { Metadata } from 'next';


import { ToastProvider } from '@/components/Toast';
import './globals.css';

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
        {/* The marketing header/footer live in (site)/layout.tsx, not here — the converted
            account pages carry their own .topbar from the demo and must render bare. */}
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
