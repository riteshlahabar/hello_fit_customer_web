import type { Metadata } from 'next';

/* page.tsx is a client component and so cannot export metadata itself. */
export const metadata: Metadata = {
  title: "HelloFit | Notifications & Reminders",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
