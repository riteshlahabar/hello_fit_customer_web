import { Brand } from './Brand';

const columns = [
  {
    heading: 'Explore',
    links: [
      { href: '#categories', label: 'Fitness categories' },
      { href: '#trainers', label: 'Find a trainer' },
      { href: '#how', label: 'How it works' },
      { href: '#testimonials', label: 'Client testimonials' },
      { href: '#search', label: 'Search services' },
    ],
  },
  {
    heading: 'HelloFit',
    links: [
      { href: '#about-hellofit', label: 'About us' },
      { href: '#about', label: 'Become a provider' },
      { href: '#about', label: 'Contact' },
      { href: '#about', label: 'Help & support' },
    ],
  },
  {
    heading: 'Good to know',
    links: [
      { href: '#about', label: 'Privacy policy' },
      { href: '#about', label: 'Terms & conditions' },
      { href: '#about', label: 'Cancellation policy' },
    ],
  },
];

const socials = [
  { label: 'Instagram', glyph: 'ig' },
  { label: 'Facebook', glyph: 'f' },
  { label: 'YouTube', glyph: '▶' },
];

export function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Brand />
            <p>
              Your time, Your Place. Find fitness professionals and make movement work for
              your life.
            </p>
            <div className="socials">
              {socials.map((social) => (
                <a key={social.label} href="#home" aria-label={social.label}>
                  {social.glyph}
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div className="footer-col" key={column.heading}>
              <h4>{column.heading}</h4>
              {column.links.map((link) => (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <span>© 2026 HelloFit. All rights reserved.</span>
          <span>Made for movement, built around you.</span>
        </div>
      </div>
    </footer>
  );
}
