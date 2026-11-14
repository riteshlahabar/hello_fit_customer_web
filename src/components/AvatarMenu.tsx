'use client';

// The topbar avatar, now a menu — and the only place logout lives.
//
// Client's instruction, 12 Nov 2026: logout on every page, in the avatar
// dropdown, and nowhere else. The sidebar button it replaces was removed.
//
// This is a new component, which the design did not supply — but logout is a
// PDF acceptance criterion (§3.1 "The customer can log out", §5.1 "...log out
// securely") and no supplied page had anywhere to put it. The avatar itself IS
// the design's: same `.avatar` class, same initials, unchanged to look at until
// it is clicked.
//
// Styles are inline rather than added to `globals.css`, which is the demo's
// stylesheet verbatim — a dropdown is ours, so it does not belong in their
// file. They are deliberately plain and borrow the design's own tokens
// (`--line`, `--ink`, `--orange`, `--shadow`) so it does not look bolted on.

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth';
import { forgetIdentity, useIdentity } from '@/lib/identity';

const PANEL: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 8px)',
  right: 0,
  minWidth: '180px',
  background: '#fff',
  border: '1px solid var(--line, #eee5dc)',
  borderRadius: '12px',
  boxShadow: 'var(--shadow, 0 12px 35px #29170b1a)',
  padding: '6px',
  zIndex: 50,
};

const ITEM: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  border: 0,
  background: 'transparent',
  padding: '10px 12px',
  borderRadius: '8px',
  font: 'inherit',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--ink, #161614)',
  cursor: 'pointer',
};

const DIVIDER: React.CSSProperties = {
  height: '1px',
  background: 'var(--line, #eee5dc)',
  margin: '5px 8px',
};

/** Where a signed-in customer needs to get to from any page. */
const ACCOUNT_LINKS: string[][] = [
  ['/dashboard', 'My Dashboard'],
  ['/my-bookings', 'My Bookings'],
  ['/billing', 'Billing History'],
  ['/refunds', 'Refunds'],
  ['/profile', 'Profile & Settings'],
];

export function AvatarMenu() {
  const { name, initials, signedIn } = useIdentity();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  // Close on an outside click or Escape. Without this the panel survives a
  // click anywhere else on the page, which on a topbar is immediately annoying.
  useEffect(() => {
    if (!open) return;

    const onDown = (event: MouseEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function onLogout() {
    setLeaving(true);
    await signOut();
    forgetIdentity();
    setOpen(false);

    // `replace`, not `push`: Back must not return to a signed-in page whose
    // refresh token has just been revoked.
    router.replace('/login');
    router.refresh();
  }

  return (
    <div ref={wrap} style={{ position: 'relative' }}>
      <div
        className="avatar"
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={signedIn ? `Account menu for ${name}` : 'Account menu'}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        style={{ cursor: 'pointer' }}
      >
        {initials}
      </div>

      {open && (
        <div style={PANEL} role="menu">
          {signedIn ? (
            <>
              <div style={{ ...ITEM, cursor: 'default', color: 'var(--muted, #77736e)', fontWeight: 500 }}>
                {name}
              </div>
              {/* The way back. Off the dashboard — on the homepage, say —
                  this menu was the only signed-in control on the page and it
                  offered no route to the account, so a stray click on Home
                  stranded you. */}
              {ACCOUNT_LINKS.map(([href, label]) => (
                <Link key={href} href={href} role="menuitem" style={ITEM} onClick={() => setOpen(false)}>
                  {label}
                </Link>
              ))}
              <div style={DIVIDER} />
              <button
                type="button"
                role="menuitem"
                style={{ ...ITEM, color: 'var(--orange, #E33E29)' }}
                onClick={onLogout}
                disabled={leaving}
              >
                {leaving ? 'Signing out…' : 'Log out'}
              </button>
            </>
          ) : (
            <button
              type="button"
              role="menuitem"
              style={ITEM}
              onClick={() => {
                setOpen(false);
                router.push('/login');
              }}
            >
              Log in
            </button>
          )}
        </div>
      )}
    </div>
  );
}
