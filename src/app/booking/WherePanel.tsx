'use client';

// Step 3 — where the trainer should come, and the notes that travel with the
// booking.
//
// The demo's three "session location" options were session formats, which
// were deleted on 20 Nov 2026 (home service only). What the booking actually
// takes is an address, so these are the customer's saved ones, in the
// design's own `.location-option` control — plus the way to add one, which
// the page never had.

import { useState } from 'react';
import { AddressForm } from './AddressForm';
import type { ApiAddress } from '@/lib/profile';

export function WherePanel({
  addresses,
  addressId,
  onAddress,
  onAdded,
  notes,
  onNotes,
}: {
  addresses: ApiAddress[];
  addressId: string;
  onAddress: (id: string) => void;
  onAdded: (address: ApiAddress) => void;
  notes: string;
  onNotes: (value: string) => void;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <>
      <div className="location-options">
        {addresses.map((saved) => (
          <button
            key={saved.id}
            type="button"
            className={`location-option${saved.id === addressId ? ' selected' : ''}`}
            data-location={saved.label}
            onClick={() => onAddress(saved.id)}
          >
            <span className="loc-icon">⌂</span>
            <span>
              <strong>{saved.label}</strong>
              <small>
                {saved.line1}
                {saved.city ? `, ${saved.city.name}` : ''} · {saved.pincode}
              </small>
            </span>
          </button>
        ))}
      </div>

      {addresses.length === 0 && !adding ? (
        <p className="muted">
          You have no saved address yet. Add the one your trainer should come to.
        </p>
      ) : null}

      {adding ? (
        <AddressForm
          onSaved={(address) => {
            setAdding(false);
            onAdded(address);
          }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button type="button" className="btn ghost add-address" onClick={() => setAdding(true)}>
          + Add a new address
        </button>
      )}

      <div className="field" style={{ marginTop: '14px' }}>
        <label htmlFor="notes">Notes for your trainer (optional)</label>
        <textarea
          id="notes"
          placeholder="Share any preferences or details that may help your session."
          value={notes}
          onChange={(e) => onNotes(e.target.value)}
        />
      </div>
    </>
  );
}
