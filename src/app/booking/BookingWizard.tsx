'use client';

// The live booking workflow (PDF §5.7). Everything the demo hard-coded is
// gone: three sample services at ₹600/₹500/₹450, six fixed November dates,
// four fixed time buttons, and a ₹600 summary.
//
// What each panel is now:
//
// - **01 Choose service** — `GET /services`, with the real duration and base
//   price. Goal and level stay as the design draws them and travel with the
//   booking in its `preferences` column.
// - **02 Date & time** — `GET /app/customer/slots`, which needs a service, a
//   day *and* an address, so the address is resolved first and a change to it
//   re-queries. An empty grid is the backend's answer, not an error.
// - **03 Location** — the customer's saved addresses, in the design's own
//   `.location-option` control. The demo's three options were session formats
//   with no field behind them; the address is the field the booking takes.
// - **04 Review** — name, email and mobile from the profile, read-only here
//   because this screen has no mandate to change the account.
//
// The summary's trainer block is not rendered: there is no public provider
// endpoint, so the website cannot name or choose one and the booking goes to
// auto-assign. PDF §5.5/§5.6 — the marketplace gap.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getServices } from '@/lib/catalog';
import type { ApiService } from '@/lib/catalog';
import { clockOf, getAddresses, getQuote, getSlots, nextDays } from '@/lib/booking';
import type { Quote, Slot } from '@/lib/booking';
import { loadProfile } from '@/lib/profile';
import type { ApiAddress } from '@/lib/profile';

const money = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const ICONS = ['🧘', '🌿', '⌂', '🏋️', '💃', '🤸'];

/** `2026-11-14` → `{ weekday: 'SAT', day: '14', month: 'NOV' }`. */
function dateParts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const when = new Date(y, m - 1, d);
  return {
    weekday: when.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase(),
    day: String(d).padStart(2, '0'),
    month: when.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase(),
    long: when.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }),
  };
}

export function BookingWizard() {
  const router = useRouter();

  const [services, setServices] = useState<ApiService[] | null>(null);
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [who, setWho] = useState({ name: '', email: '', mobile: '' });

  const [serviceId, setServiceId] = useState('');
  const [addressId, setAddressId] = useState('');
  const [date, setDate] = useState('');
  /**
   * The grid, tagged with the query it answers. Comparing that tag with the
   * current one is what makes "loading" a derived value — so switching day
   * cannot flash the previous day's times, and the effect never has to reset
   * state synchronously on its way in.
   */
  const [loaded, setLoaded] = useState<{ key: string; slots: Slot[]; note: string | null } | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);

  const [goal, setGoal] = useState('Improve flexibility');
  const [level, setLevel] = useState('Beginner');
  const [notes, setNotes] = useState('');

  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(() => nextDays(6), []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const [live, saved, profile] = await Promise.all([
        getServices(),
        getAddresses(),
        loadProfile(),
      ]);

      if (cancelled) return;

      if (profile.unauthorised) {
        router.replace('/login');
        return;
      }

      setServices(live);
      setServiceId((current) => current || live[0]?.id || '');
      setAddresses(saved ?? []);
      setAddressId((current) => current || saved?.[0]?.id || '');
      setDate((current) => current || days[0]);

      if (profile.form) {
        setWho({
          name: [profile.form.firstName, profile.form.lastName].filter(Boolean).join(' '),
          email: profile.form.email,
          mobile: profile.form.mobile,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, days]);

  // `GET /slots` needs all three, so there is nothing to ask for until the
  // address resolves. Derived rather than written into state by the effect.
  const canQuerySlots = Boolean(serviceId && date && addressId);
  const slotKey = `${serviceId}|${date}|${addressId}`;

  // The slot grid. Re-queried whenever any of its three inputs moves.
  useEffect(() => {
    if (!canQuerySlots) return;

    let cancelled = false;

    void (async () => {
      const result = await getSlots(serviceId, date, addressId);
      if (cancelled) return;

      setLoaded({ key: slotKey, slots: result.slots, note: result.error ?? result.message ?? null });
      setSlot(null);
    })();

    return () => {
      cancelled = true;
    };
  }, [serviceId, date, addressId, canQuerySlots, slotKey]);

  // Only the answer to the query being shown counts.
  const showing = loaded?.key === slotKey ? loaded : null;

  // The price. The server computes it; this never adds anything up locally.
  useEffect(() => {
    if (!serviceId) return;

    let cancelled = false;

    void (async () => {
      const result = await getQuote({ serviceId });
      if (!cancelled) setQuote(result.quote ?? null);
    })();

    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  const service = services?.find((s) => s.id === serviceId);
  const address = addresses.find((a) => a.id === addressId);

  const toCheckout = useCallback(() => {
    if (!service) return setError('Choose a service.');
    if (!addressId) return setError('Choose or add a session address.');
    if (!slot) return setError('Choose an available time.');

    const query = new URLSearchParams({
      service: service.id,
      address: addressId,
      date,
      from: String(slot.fromMinute),
      to: String(slot.toMinute),
      goal,
      level,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    });

    router.push(`/checkout?${query}`);
  }, [service, addressId, slot, date, goal, level, notes, router]);

  return (
    <div className="layout">
      <div className="booking-main">
        <section className="panel" id="servicePanel">
          <div className="panel-head">
            <span className="panel-icon">✳</span>
            <div><h2>01. Choose your service</h2><p>Select the session that best fits your goals.</p></div>
          </div>

          {services === null && <p className="muted">Loading services…</p>}
          {services?.length === 0 && <p className="muted">No services are published yet.</p>}

          <div className="service-grid">
            {(services ?? []).map((item, index) => (
              <button
                key={item.id}
                className={`service-option${item.id === serviceId ? ' selected' : ''}`}
                data-service={item.name}
                data-price={item.basePrice}
                onClick={() => setServiceId(item.id)}
              >
                <span className="radio"></span>
                <span className="service-icon">{ICONS[index % ICONS.length]}</span>
                <strong>{item.name}</strong>
                <p>{item.category?.name ?? 'Session'} · {item.durationMin} minutes</p>
                <span className="service-price">{money(Number(item.basePrice))} <small>/ session</small></span>
              </button>
            ))}
          </div>

          <div className="field-grid" style={{ marginTop: '17px' }}>
            <div className="field">
              <label htmlFor="goal">What is your main goal?</label>
              <select id="goal" value={goal} onChange={(e) => setGoal(e.target.value)}>
                <option>Improve flexibility</option>
                <option>Build strength</option>
                <option>Reduce stress</option>
                <option>Beginner routine</option>
                <option>General fitness</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="level">Your experience level</label>
              <select id="level" value={level} onChange={(e) => setLevel(e.target.value)}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
          </div>
        </section>

        <section className="panel" id="datePanel">
          <div className="panel-head">
            <span className="panel-icon">▦</span>
            <div><h2>02. Pick a date &amp; time</h2><p>Times come from your trainer availability for this service.</p></div>
          </div>

          <div className="date-grid" id="dateGrid">
            {days.map((day) => {
              const parts = dateParts(day);
              return (
                <button
                  key={day}
                  className={`date-option${day === date ? ' selected' : ''}`}
                  data-date={parts.long}
                  onClick={() => setDate(day)}
                >
                  <small>{parts.weekday}</small>
                  <strong>{parts.day}</strong>
                  <small>{parts.month}</small>
                </button>
              );
            })}
          </div>

          <div className="subheading">Available times</div>

          {!canQuerySlots ? (
            <p className="muted">Add a session address below to see available times.</p>
          ) : showing === null ? (
            <p className="muted">Checking availability…</p>
          ) : (
            <div className="time-grid" id="timeGrid">
              {showing.slots.map((option) => (
                <button
                  key={option.fromMinute}
                  className={`time-option${slot?.fromMinute === option.fromMinute ? ' selected' : ''}`}
                  onClick={() => setSlot(option)}
                >
                  {clockOf(option.fromMinute)}
                </button>
              ))}
            </div>
          )}

          {showing?.note && <p className="muted" style={{ marginTop: '10px' }}>{showing.note}</p>}
        </section>

        <section className="panel" id="locationPanel">
          <div className="panel-head">
            <span className="panel-icon">⌖</span>
            <div><h2>03. Choose session location</h2><p>Where your trainer should come.</p></div>
          </div>

          <div className="location-options">
            {addresses.map((saved) => (
              <button
                key={saved.id}
                className={`location-option${saved.id === addressId ? ' selected' : ''}`}
                data-location={saved.label}
                onClick={() => setAddressId(saved.id)}
              >
                <span className="loc-icon">⌂</span>
                <span>
                  <strong>{saved.label}</strong>
                  <small>{saved.line1}{saved.city ? `, ${saved.city.name}` : ''} · {saved.pincode}</small>
                </span>
              </button>
            ))}
          </div>

          {addresses.length === 0 && (
            <p className="muted">
              You have no saved address yet. Add one in <a href="/profile">your profile</a> and it will appear here.
            </p>
          )}

          <div className="field" style={{ marginTop: '14px' }}>
            <label htmlFor="notes">Notes for your trainer (optional)</label>
            <textarea id="notes" placeholder="Share any preferences or details that may help your session."
              value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
          </div>
        </section>

        <section className="panel" id="reviewPanel">
          <div className="panel-head">
            <span className="panel-icon">✓</span>
            <div><h2>04. Review your booking</h2><p>Double-check your selections before moving to payment.</p></div>
          </div>
          <div className="field-grid">
            <div className="field">
              <label htmlFor="customerName">Your full name</label>
              <input id="customerName" readOnly={true} value={who.name} />
            </div>
            <div className="field">
              <label htmlFor="customerEmail">Email address</label>
              <input id="customerEmail" type="email" readOnly={true} value={who.email} placeholder="Add one in your profile" />
            </div>
            <div className="field full">
              <label htmlFor="customerPhone">Mobile number</label>
              <input id="customerPhone" type="tel" readOnly={true} value={who.mobile} />
            </div>
          </div>
          <p style={{ fontSize: '9px', color: 'var(--muted)', margin: '12px 0 0' }}>
            These come from your account. Change them in <a href="/profile">your profile</a>.
          </p>
        </section>

        <div className="bottom-actions">
          <button className="back-link" onClick={() => router.push('/')}>← Back</button>
          <button className="btn primary" onClick={toCheckout}>Continue to Payment ↗</button>
        </div>
        {error && <p className="muted" style={{ color: 'var(--orange)' }}>{error}</p>}
      </div>

      <aside>
        <section className="summary-card">
          <h2>Booking summary</h2>
          <div className="summary-details">
            <div className="summary-line"><span>Service</span><strong id="sumService">{service?.name ?? '—'}</strong></div>
            <div className="summary-line"><span>Date</span><strong id="sumDate">{date ? dateParts(date).long : '—'}</strong></div>
            <div className="summary-line"><span>Time</span><strong id="sumTime">{slot ? clockOf(slot.fromMinute) : 'Choose a time'}</strong></div>
            <div className="summary-line"><span>Location</span><strong id="sumLocation">{address?.label ?? '—'}</strong></div>
            <div className="summary-line"><span>Duration</span><strong id="sumDuration">{service ? `${service.durationMin} minutes` : '—'}</strong></div>
          </div>
          <div className="price-breakdown">
            <div className="summary-line"><span>Session fee</span><strong id="sumFee">{quote ? money(quote.grossAmount) : '—'}</strong></div>
            <div className="summary-line"><span>Travel</span><strong id="sumPlatform">{quote ? money(quote.travelCharge) : '—'}</strong></div>
            <div className="summary-line"><span>Taxes</span><strong id="sumTax">{quote ? money(quote.tax) : '—'}</strong></div>
            <div className="summary-line total"><span>Total</span><strong id="sumTotal">{quote ? money(quote.payable) : '—'}</strong></div>
          </div>
          <button className="btn primary" onClick={toCheckout}>Continue to Payment ↗</button>
          <p className="terms">By continuing, you agree to the booking terms and cancellation policy shown at checkout.</p>
          <div className="secure">♧ Secure checkout</div>
        </section>
        <section className="help-card">
          <h3>Need a hand?</h3>
          <p>Questions about your session? Our support experience can help you through booking.</p>
          <a href="mailto:support@hellofit.example" style={{ display: 'inline-block' }}>Contact support →</a>
        </section>
      </aside>
    </div>
  );
}
