'use client';

import { useState } from 'react';
import { Brand } from './Brand';
import { useToast } from './Toast';

const links = [
  { href: '#categories', label: 'Explore Fitness' },
  { href: '#trainers', label: 'Find a Trainer' },
  { href: '#how', label: 'How It Works' },
  { href: '#about-hellofit', label: 'About Us' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const showToast = useToast();

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
          <button
            className="btn btn-ghost"
            onClick={() => showToast('Login and registration screen will be designed next.')}
          >
            Log in
          </button>
          <button
            className="btn btn-primary"
            onClick={() => showToast('Registration flow will be connected in a later phase.')}
          >
            Get Started <span>↗</span>
          </button>
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
