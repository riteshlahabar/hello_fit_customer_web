'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Brand } from './Brand';

/**
 * `page` links navigate; the rest scroll to a section of the homepage, which
 * is what the demo's header did and what the anchors below still exist for.
 *
 * "Find a Trainer" became a real link because every other page's header
 * already points at `/find-a-trainer` — the homepage was the odd one out,
 * scrolling to a band of static trainer cards instead. **That page itself is
 * not live**: there is no public provider search endpoint (PDF §5.5/§5.6, the
 * marketplace rework), so it still shows the demo's listings. Linking it at
 * least makes the header consistent and the page reachable.
 *
 * "Explore Fitness" stays an anchor on purpose: `#categories` is the homepage's
 * category grid and that grid already reads the live API, so it is the real
 * thing already. There is no separate services page in the supplied designs to
 * send it to.
 */
const links = [
  { href: '#categories', label: 'Explore Fitness', page: false },
  { href: '/find-a-trainer', label: 'Find a Trainer', page: true },
  { href: '#how', label: 'How It Works', page: false },
  { href: '#about-hellofit', label: 'About Us', page: false },
];

export function Header() {
  const [open, setOpen] = useState(false);

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
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ),
          )}
        </nav>

        <div className="nav-actions">
          {/* Both now go to the real login page. They were toasts saying the
              screen "will be designed next" — it exists and is wired, so the
              placeholders went with it. Same classes, same labels. */}
          <Link className="btn btn-ghost" href="/login">
            Log in
          </Link>
          <Link className="btn btn-primary" href="/login">
            Get Started <span>↗</span>
          </Link>
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
