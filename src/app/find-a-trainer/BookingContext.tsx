// "You are booking ‹service› on ‹package›" — the visible half of
// `?service=` and `?package=` (client, 21 Nov 2026).
//
// Without it the narrowing is invisible: the list quietly shows only the
// providers approved for one service and nothing on the page says which, so a
// short list reads as "hardly any trainers on HelloFit" rather than "these
// are the ones who teach this". It is also the only way back — the customer
// can change either choice from here instead of using the browser's history.
//
// Server-rendered: both names are already in hand on the page, and a strip
// above a price should not arrive a beat after the prices do.

import Link from 'next/link';
import type { ApiService } from '@/lib/catalog';
import type { Package } from '@/lib/packages';

const rupees = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

export function BookingContext({
  service,
  pack,
}: {
  service?: ApiService;
  pack?: Package;
}) {
  if (!service) return null;

  return (
    <section className="container booking-context">
      <div>
        <span className="eyebrow">You are booking</span>
        <strong>{service.name}</strong>
        <small>
          {service.durationMin} minutes per session
          {pack ? ` · ${pack.name}` : ''}
          {pack?.perSessionPrice ? ` · ${rupees(pack.perSessionPrice)} per session` : ''}
        </small>
      </div>
      <div className="booking-context-links">
        <Link href="/packages">Change service or package</Link>
      </div>
    </section>
  );
}
