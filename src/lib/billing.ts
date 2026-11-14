// Billing History and Refunds — Phase 4, 13 Nov 2026.
//
// Both read the money records the API has had since the payment phase:
// `Invoice`, raised per booking when a payment settles, and `Refund`, raised
// by a cancellation. **No new tables were needed for either page.**
//
// Two things the demo drew that cannot be read, and are therefore not here:
//
//   * **A subscription.** The demo's billing page is built around auto-renew,
//     a next billing date and a saved payment method. The client's 13 Nov
//     decision is that there is **no recurring payment** — choosing a plan
//     records the choice and charges nothing — so those have no field behind
//     them and no honest value to show.
//   * **An invoice status column.** Every `Invoice` row exists because a
//     payment settled; there is no unpaid invoice to report. The column is
//     rendered as Paid from that fact rather than from a status field, which
//     is what it already means.

import { apiGetResult } from './api';
import { tokenStore } from './auth';

export interface Invoice {
  id: string;
  invoiceNo: string;
  issuedAt: string;
  /** Derived from the booking: service name, plus the session count. */
  description: string;
  bookingId: string;
  bookingCode: string;
  taxableValue: number;
  /** CGST/SGST/IGST as the invoice stored them; the split varies by state. */
  taxBreakup: Record<string, number> | null;
  total: number;
  pdfUrl: string | null;
}

export interface Refund {
  id: string;
  bookingId: string;
  bookingCode: string;
  service: string | null;
  amount: number;
  mode: 'WALLET' | 'SOURCE';
  status:
    | 'PENDING'
    | 'APPROVED'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'REJECTED'
    | 'FAILED';
  /** Which policy slab produced this amount (PDF 3.5) — the honest "why". */
  slabApplied: string | null;
  requestedAt: string;
  processedAt: string | null;
}

/** `null` means no token at all, as distinct from an empty list. */
export async function listInvoices(): Promise<Invoice[] | null> {
  const token = tokenStore.access;
  if (!token) return null;

  const result = await apiGetResult<Invoice[]>('/app/customer/invoices', {
    token,
  });

  return result.ok ? result.data : [];
}

export async function listRefunds(): Promise<Refund[] | null> {
  const token = tokenStore.access;
  if (!token) return null;

  const result = await apiGetResult<Refund[]>('/app/customer/refunds', {
    token,
  });

  return result.ok ? result.data : [];
}

export const rupees = (value: number) =>
  `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** `2026-10-12T…` → `12 Oct 2026`, as every table on this site writes a date. */
export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

/** `MORE_THAN_24H` → `More than 24h`. The slab names are SCREAMING_SNAKE. */
export const humanSlab = (slab: string | null) =>
  slab
    ? slab.charAt(0) + slab.slice(1).toLowerCase().replace(/_/g, ' ')
    : null;

/** The demo's three status pills: amber pending, green done, red refused. */
export function refundTone(status: Refund['status']): string {
  if (status === 'COMPLETED' || status === 'APPROVED') return 'ok';
  if (status === 'REJECTED' || status === 'FAILED') return 'bad';
  return 'wait';
}
