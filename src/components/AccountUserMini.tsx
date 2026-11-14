'use client';

// The sidebar's user card — avatar, name, "Member since".
//
// The dashboard draws its own (`LiveUserMini` in `dashboard/LiveIdentity.tsx`)
// and that one stays where it is. This is the same card for the shared
// sidebar, so stepping from Overview to Billing no longer drops it.
//
// `Member since` is `UNKNOWN`, not a date: `CustomerProfile` has no `createdAt`
// on the profile payload, and the dashboard's card made the same choice rather
// than inventing one.

import { UNKNOWN, useIdentity } from '@/lib/identity';

export function AccountUserMini() {
  const { name, initials } = useIdentity();

  return (
    <div className="hf-user-mini">
      <div className="hf-user-pic">{initials}</div>
      <div>
        <strong>{name}</strong>
        <small>Member since {UNKNOWN}</small>
      </div>
    </div>
  );
}
