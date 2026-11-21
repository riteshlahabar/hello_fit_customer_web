'use client';

// "Add a new address" inside the booking flow — client, 21 Nov 2026: "in
// session location give add to address of customer, or if it is already
// filled then previous address, and also give option add new address."
//
// **The PIN is the important field.** `findSlots` answers an address with no
// `areaId` with an empty grid — it matches trainers by the areas they serve —
// and the profile screen has been creating exactly those, so twenty of the
// twenty-nine addresses in the development database can never show a time.
// `POST /addresses` resolves the area from the PIN itself; a PIN that
// straddles two areas comes back with the candidates, which this turns into a
// choice rather than an error the customer can only read.

import { useState } from 'react';
import { createAddress, resolvePincode, type ApiArea } from '@/lib/addresses';
import type { ApiAddress } from '@/lib/profile';

const PIN = /^[1-9][0-9]{5}$/;

export function AddressForm({
  onSaved,
  onCancel,
}: {
  onSaved: (address: ApiAddress) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    label: 'Home',
    line1: '',
    line2: '',
    landmark: '',
    pincode: '',
  });
  const [choices, setChoices] = useState<ApiArea[]>([]);
  const [areaId, setAreaId] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (field: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  /** Tells the customer whether we serve the PIN before they fill the rest. */
  async function checkPin(pincode: string) {
    set('pincode')(pincode);
    setChoices([]);
    setAreaId('');

    if (!PIN.test(pincode)) return setStatus(null);

    const answer = await resolvePincode(pincode);

    if (!answer) return setStatus(null);

    if (!answer.serviceable) {
      return setStatus(
        'HelloFit does not cover this PIN code yet. You can still save the address, but no times will show for it.',
      );
    }

    if (answer.areas.length > 1) {
      setChoices(answer.areas);
      return setStatus('This PIN covers more than one area — choose yours.');
    }

    setStatus(`We cover ${answer.areas[0].name}, ${answer.areas[0].cityName}.`);
  }

  async function save() {
    if (!form.line1.trim()) return setStatus('Add the house or flat and street.');
    if (!PIN.test(form.pincode)) return setStatus('Enter a 6-digit PIN code.');
    if (choices.length > 1 && !areaId) return setStatus('Choose your area.');

    setSaving(true);
    const outcome = await createAddress({ ...form, ...(areaId ? { areaId } : {}) });
    setSaving(false);

    if (outcome.address) return onSaved(outcome.address);

    if (outcome.choices) {
      setChoices(outcome.choices);
      return setStatus('This PIN covers more than one area — choose yours.');
    }

    setStatus(outcome.error ?? 'The address could not be saved.');
  }

  return (
    <div className="address-form">
      <div className="field-grid">
        <div className="field">
          <label htmlFor="addrLabel">Name this address</label>
          <input
            id="addrLabel"
            value={form.label}
            onChange={(e) => set('label')(e.target.value)}
            placeholder="Home, Office, Mum's place"
          />
        </div>
        <div className="field">
          <label htmlFor="addrPin">PIN code</label>
          <input
            id="addrPin"
            inputMode="numeric"
            maxLength={6}
            value={form.pincode}
            onChange={(e) => void checkPin(e.target.value.replace(/\D/g, ''))}
          />
        </div>
        <div className="field full">
          <label htmlFor="addrLine1">House / flat and street</label>
          <input
            id="addrLine1"
            value={form.line1}
            onChange={(e) => set('line1')(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="addrLine2">Area or locality (optional)</label>
          <input
            id="addrLine2"
            value={form.line2}
            onChange={(e) => set('line2')(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="addrLandmark">Landmark (optional)</label>
          <input
            id="addrLandmark"
            value={form.landmark}
            onChange={(e) => set('landmark')(e.target.value)}
          />
        </div>

        {choices.length > 1 ? (
          <div className="field full">
            <label htmlFor="addrArea">Your area</label>
            <select id="addrArea" value={areaId} onChange={(e) => setAreaId(e.target.value)}>
              <option value="">Choose your area…</option>
              {choices.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}, {area.cityName}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {status ? <p className="muted">{status}</p> : null}

      <div className="address-form-actions">
        <button type="button" className="text-link" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn primary" disabled={saving} onClick={() => void save()}>
          {saving ? 'Saving…' : 'Save address'}
        </button>
      </div>
    </div>
  );
}
