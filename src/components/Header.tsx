'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useIdentity } from '@/lib/identity';
import { AvatarMenu } from './AvatarMenu';
import { SidebarToggle } from './SidebarToggle';
import { Brand } from './Brand';

/**
 * The one marketing menu, identical here and on the four converted pages that
 * carry their own inline header (booking, checkout, find-a-trainer,
 * trainer-profile).
 *
 * **The client's demo disagreed with itself.** index.html drew four items
 * (Explore Fitness / Find a Trainer / How It Works / About Us); the inner
 * pages drew six (Home / Find a Trainer / Categories / How It Works / About /
 * Contact). Clicking Home therefore landed you on a header missing half its
 * items, with Categories renamed. Client's call, 13 Nov 2026: one menu,
 * "Explore Fitness" as the wording, and Contact pointing at the real
 * /support-tickets page rather than the demo's dead #footer anchor.
 *
 * `page` links navigate; the rest scroll to a section of the homepage.
 * Those section IDs exist only here, so off the homepage they did nothing at
 * all — the mobile menu just closed and the visitor saw no reaction.
 * `sectionHref` prefixes them with `/` everywhere except the homepage, where
 * a bare hash is kept so the browser smooth-scrolls instead of navigating.
 */
const links = [
  { href: '/', label: 'Home', page: true },
  { href: '#categories', label: 'Explore Fitness', page: false },
  { href: '/packages', label: 'Packages', page: true },
  { href: '/find-a-trainer', label: 'Find a Trainer', page: true },
  { href: '#how', label: 'How It Works', page: false },
  { href: '#about-hellofit', label: 'About Us', page: false },
  { href: '/support-tickets', label: 'Contact', page: true },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const onHome = usePathname() === '/';
  const { signedIn } = useIdentity();

  // A homepage-only ID is unreachable from the other 21 pages unless the link
  // takes the visitor home first.
  const sectionHref = (hash: string) => (onHome ? hash : `/${hash}`);

  return (
    <header>
      <div className="container nav">
        <Brand />

        <nav className={open ? 'nav-links open' : 'nav-links'} id="navLinks">
          {links.map((link) =>
            link.page ? (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ) : (
              <a key={link.href} href={sectionHref(link.href)} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ),
          )}
        </nav>

        <div className="nav-actions">
          {/*
            The avatar is still mounted **unconditionally here**, which is not
            an oversight — do not wrap it in a `signedIn` check.

            `useIdentity` only knows who you are in the browser, so a
            `signedIn ? <AvatarMenu/> : …` gate puts no avatar in the server
            HTML at all — and logout lives in that menu (client instruction,
            12 Nov 2026). The first version of this file did exactly that and
            smoke:web-logout failed on all 14 signed-in pages.

            Hiding it from visitors is AvatarMenu's own job, and it is done
            there on `ready && !signedIn` so the server markup is untouched.
            See the note above its early return for why the flag has to be
            `ready` rather than `signedIn`.

            The two buttons are the signed-out state of the demo's homepage
            header, so they go when there is someone to greet.
          */}
          {!signedIn && (
            <>
              <Link className="btn btn-ghost" href="/login">
                Log in
              </Link>
              <Link className="btn btn-primary" href="/login">
                Get Started <span>↗</span>
              </Link>
            </>
          )}
          <AvatarMenu />
          <SidebarToggle />
          <button
            className="menu-toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </header>
  );
}
