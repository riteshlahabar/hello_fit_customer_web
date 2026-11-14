'use client';

// The Billing History table, in the client's own `<table>` markup.
//
// The demo filled `<tbody id="billingRows">` from an inline script with four
// invented rows ("Plus Plan · Monthly", ₹499.00). This is that tbody, read
// from `GET /app/customer/invoices`.
//
// Client-side because the access token lives in `localStorage`, so the server
// cannot know who is asking — the same shape as `SavedBoard` and `NoticeList`.
//
// **Export history writes the rows already fetched**, not a server call: the
// customer is downloading what is on their screen, and an export endpoint
// would be a second place for the same numbers to come from.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  listInvoices,
  rupees,
  shortDate,
  type Invoice,
} from '@/lib/billing';

const COLUMNS = 6;

function csv(rows: Invoice[]): string {
  const head = ['Invoice', 'Date', 'Description', 'Booking', 'Taxable', 'Total'];
  const body = rows.map((row) => [
    row.invoiceNo,
    shortDate(row.issuedAt),
    row.description,
    row.bookingCode,
    row.taxableValue,
    row.total,
  ]);

  return [head, ...body]
    .map((line) =>
      line.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','),
    )
    .join('\r\n');
}

function Message({ children }: { children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={COLUMNS} style={{ textAlign: 'center', padding: '26px 10px' }}>
        {children}
      </td>
    </tr>
  );
}

export function InvoiceTable() {
  const [rows, setRows] = useState<Invoice[] | null>(null);
  const [signedIn, setSignedIn] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const invoices = await listInvoices();
      if (cancelled) return;

      setSignedIn(invoices !== null);
      setRows(invoices ?? []);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const download = () => {
    if (!rows?.length) return;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(
      new Blob([csv(rows)], { type: 'text/csv;charset=utf-8;' }),
    );
    link.download = 'hellofit-billing-history.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <section className="card">
      <div className="card-head">
        <div>
          <h2>Billing history</h2>
          <div className="sub">Your invoices and payment records</div>
        </div>
        <button
          className="link-btn"
          id="downloadAll"
          onClick={download}
          disabled={!rows?.length}
        >
          ↓ Export history
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody id="billingRows">
            {!signedIn && (
              <Message>
                <Link href="/login?next=%2Fbilling">Log in</Link> to see your
                invoices.
              </Message>
            )}
            {signedIn && rows === null && <Message>Loading your invoices…</Message>}
            {signedIn && rows?.length === 0 && (
              <Message>
                No invoices yet. One is raised for every booking you pay for.
              </Message>
            )}
            {rows?.map((row) => (
              <tr key={row.id}>
                <td>
                  <strong>{row.invoiceNo}</strong>
                </td>
                <td>{shortDate(row.issuedAt)}</td>
                <td>{row.description}</td>
                <td>{rupees(row.total)}</td>
                <td>
                  {/* Every invoice exists because a payment settled — there is
                      no unpaid invoice in this API to report. */}
                  <span className="status paid">Paid</span>
                </td>
                <td>
                  {row.pdfUrl ? (
                    <a
                      className="receipt"
                      href={row.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  ) : (
                    <Link className="receipt" href={`/session-details?id=${row.bookingId}`}>
                      Booking
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
