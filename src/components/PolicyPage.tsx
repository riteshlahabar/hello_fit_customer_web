import Link from 'next/link';

/**
 * The shell for Privacy Policy and Terms & Conditions — PDF §5.3, which lists
 * both as required informational pages. Neither exists in the client's demo, so
 * there is no supplied design and nothing to convert.
 *
 * **It ships with no policy text, on purpose.** §5.3's acceptance criterion is
 * "Policy content supplied or approved by the client is published on the
 * relevant pages" — so the page is built and routed, and the words are left to
 * the client. Writing plausible-looking privacy or liability terms would create
 * a document the business could be held to, invented by a contractor who was
 * never asked for it.
 *
 * The notice below is deliberately visible rather than a code comment: whoever
 * opens this page should see immediately that it is awaiting copy.
 */

const NOTE: React.CSSProperties = {
  border: '1px dashed var(--line, #e3d9ce)',
  borderRadius: '14px',
  padding: '22px 24px',
  background: 'var(--ivory, #fdfaf6)',
  color: 'var(--muted, #6f655c)',
  lineHeight: 1.7,
};

export function PolicyPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  /** Headings the client's copy is expected to fill. */
  sections: string[];
}) {
  return (
    <main className="container" style={{ padding: '40px 20px 60px', maxWidth: '860px' }}>
      <div className="breadcrumb" style={{ marginBottom: '14px' }}>
        <Link href="/">Home</Link> / <span>{title}</span>
      </div>

      <h1 style={{ marginBottom: '10px' }}>{title}</h1>
      <p style={{ color: 'var(--muted, #6f655c)', marginBottom: '26px' }}>{intro}</p>

      <div style={NOTE}>
        <strong>This page is awaiting content from HelloFit.</strong>
        <p style={{ margin: '8px 0 0' }}>
          The page and its route are in place. The wording of this policy must be
          supplied or approved by HelloFit before launch — it is a legal document and
          is not drafted here.
        </p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2 style={{ fontSize: '15px', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Sections to be supplied
        </h2>
        <ul style={{ lineHeight: 2, color: 'var(--muted, #6f655c)' }}>
          {sections.map((section) => (
            <li key={section}>{section}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}
