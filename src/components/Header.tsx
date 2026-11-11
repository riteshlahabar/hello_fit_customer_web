'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Brand } from './Brand';

const links = [
  { href: '#categories', label: 'Explore Fitness' },
  { href: '#trainers', label: 'Find a Trainer' },
  { href: '#how', label: 'How It Works' },
  { href: '#about-hellofit', label: 'About Us' },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header>
      <div className="container nav">
        <Brand />

        <nav className={open ? 'nav-links open' : 'nav-links'} id="navLinks">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
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
