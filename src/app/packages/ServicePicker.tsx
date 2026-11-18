'use client';

// The service picker above the package cards.
//
// A package holds a percent, not a price, so the cards show rupees only once
// a service supplies the rate the percent applies to. The pick travels in the
// URL (`/packages?service=<slug>`) rather than in component state, so the
// page stays server-rendered with real prices, the choice survives a reload
// and a priced page can be shared as a link.
//
// Group services are filtered out by the page: `GET /packages?serviceId=` of
// a group service answers with an empty list, because a group prices by slab.

import { useRouter } from 'next/navigation';
import type { ApiService } from '@/lib/catalog';

export function ServicePicker({
  services,
  selected,
}: {
  services: ApiService[];
  selected?: string;
}) {
  const router = useRouter();

  if (services.length === 0) return null;

  return (
    <div className="service-picker">
      <label htmlFor="package-service">See prices for</label>

      <select
        id="package-service"
        value={selected ?? ''}
        onChange={(event) => {
          const slug = event.target.value;
          router.push(slug ? `/packages?service=${slug}` : '/packages');
        }}
      >
        <option value="">Terms only — no service picked</option>
        {services.map((service) => (
          <option key={service.id} value={service.slug}>
            {service.name}
          </option>
        ))}
      </select>

      <p className="service-picker-note">
        Every package applies its adjustment to the service you pick here. The
        final amount is confirmed with your trainer at checkout.
      </p>
    </div>
  );
}
