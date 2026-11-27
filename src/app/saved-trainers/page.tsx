import Link from 'next/link';
import type { Metadata } from 'next';
import { SavedBoard } from './SavedBoard';
import './page.css';
import { AccountSidebar } from '@/components/AccountSidebar';

/**
 * Converted from the demo's hellofit-saved-trainers-favourites.html.
 * The markup and styling are the client's design; only the mechanics are React.
 */

export const metadata: Metadata = {
  title: "HelloFit | Saved Trainers",
};

export default function SavedTrainersPage() {
  return (
    <div data-hf-page="saved-trainers">
      <main className="wrap"><div className="hf-account-shell"><AccountSidebar current="/saved-trainers" /><div className="hf-account-main"><div className="crumb"><Link href="/">Home</Link> / <Link href="/dashboard">My Account</Link> / <span>Saved Trainers</span></div><section className="hero"><div><div className="eyebrow">Your personal shortlist</div><h1>SAVED TRAINERS<span style={{ color: "var(--orange)" }}>.</span></h1><p>Your favourites, all in one place. Ready when you are.</p></div><Link className="btn primary" href="/find-a-trainer">＋ Explore trainers</Link></section><section className="summary"><div><div className="small">YOUR FITNESS SHORTLIST</div><strong id="savedCount">4 trainers saved</strong><div className="small" style={{ marginTop: "7px" }}>Keep your favourite coaches close and book when it feels right.</div></div><div className="right"><div className="stat"><label>Avg. rating</label><strong>4.9 <span style={{ fontSize: "15px", color: "#f0b33c" }}>★</span></strong></div><div className="stat"><label>Starting from</label><strong>₹450</strong></div></div></section><div className="toolbar"><div className="search"><input id="search" type="search" placeholder="Search saved trainers or specialities..." aria-label="Search saved trainers" /></div><select id="specialty"><option value="all">All specialities</option><option value="Yoga">Yoga</option><option value="Strength Training">Strength Training</option><option value="Pilates">Pilates</option><option value="Fitness Coaching">Fitness Coaching</option></select><select id="sort"><option value="recommended">Recommended</option><option value="rating">Highest rated</option><option value="priceLow">Price: low to high</option><option value="priceHigh">Price: high to low</option></select></div><div className="tabs"><button className="tab active" data-type="all">All saved</button><button className="tab" data-type="available">Available for booking</button><button className="tab" data-type="online">Online sessions</button></div><SavedBoard /><div className="hint">Sample trainer profiles and prices for the HelloFit design prototype.</div></div></div></main><div className="modalbg" id="modalbg"><div className="modal"><h2 id="mtitle">Trainer details</h2><p id="mbody"></p><div className="actions"><button className="btn light" id="mclose">Close</button><button className="btn primary" id="mgo">View profile</button></div></div></div><div className="toast" id="toast"></div>
    </div>
  );
}
