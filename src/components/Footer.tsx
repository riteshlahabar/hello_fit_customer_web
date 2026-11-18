import Link from 'next/link';
import { Brand } from './Brand';

/**
 * The one footer, on all 22 pages.
 *
 * It replaces fifteen inline copies from the demo, between them carrying **28
 * links to `#footer`** — an anchor pointing at the footer the visitor was
 * already looking at. Privacy Policy, Terms & Conditions, Help Centre, FAQs,
 * Contact Us and Become a Trainer all did nothing at all.
 *
 * Every link here resolves to a route that exists. The rule for this file: if
 * there is no page, there is no link — a heading with nothing under it is
 * honest, a link that goes nowhere is not.
 *
 * `Become a Trainer` and `Provider Help` are deliberately absent until the
 * provider surfaces exist (§4, `instructor_app/`). They were in the demo; they
 * pointed nowhere then and would point nowhere now.
 */

interface FooterLink {
  href: string;
  label: string;
  /** A section of the homepage rather than a page of its own. */
  section?: boolean;
}

const columns: { heading: string; links: FooterLink[] }[] = [
  {
    heading: 'Explore',
    links: [
      { href: '/', label: 'Home' },
      { href: '/#categories', label: 'Fitness categories', section: true },
      { href: '/find-a-trainer', label: 'Find a trainer' },
      { href: '/packages', label: 'Packages' },
      { href: '/#how', label: 'How it works', section: true },
    ],
  },
  {
    heading: 'Your account',
    links: [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/my-bookings', label: 'My bookings' },
      { href: '/profile', label: 'Profile & settings' },
      { href: '/reviews', label: 'Reviews' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { href: '/#about-hellofit', label: 'About us', section: true },
      { href: '/support-tickets', label: 'Contact us' },          
      { href: '/refunds', label: 'Refunds & cancellations' },      
      { href: '/privacy-policy', label: 'Privacy policy' },
      { href: '/terms-conditions', label: 'Terms & conditions' },
      { href: '/help', label: 'Help & support' },
    ],
  },  
];

export function Footer() {
  return (
    <footer id="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Brand />
            <p>
              Your time, Your Place. Find fitness professionals and make movement work for
              your life.
            </p>
          </div>

          {columns.map((column) => (
            <div className="footer-col" key={column.heading}>
              <h4>{column.heading}</h4>
              {column.links.map((link) => (
                <Link key={link.label} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <span>© 2026 HelloFit. All rights reserved.</span>
          <span>Your time, Your Place.</span>
        </div>
      </div>
    </footer>
  );
}
