/**
 * The homepage's own scope.
 *
 * The announcement bar, header and footer moved up to the root layout on
 * 13 Nov 2026 so every page carries the same ones. What is left here is the
 * `data-hf-page="home"` wrapper that `site.css` is scoped to — the homepage's
 * own 271 rules, which must not apply to any other route.
 *
 * `site.css` itself is imported by the root layout, because the shared header
 * and footer are styled by it too.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <div data-hf-page="home">{children}</div>;
}
