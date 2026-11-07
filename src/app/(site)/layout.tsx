import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import './site.css';

/**
 * The public marketing shell — announcement bar, nav header, footer.
 *
 * Only the homepage uses it. Every signed-in page in the demo ships its own `.topbar`
 * inside its own markup, so those routes sit outside this group and render bare.
 *
 * `data-hf-page="home"` is what scopes site.css; the header and footer must sit inside it.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-hf-page="home">
      <div className="announcement">
        MOVE BETTER. FEEL STRONGER. <strong>YOUR FITNESS, YOUR WAY.</strong>
      </div>
      <Header />
      {children}
      <Footer />
    </div>
  );
}
