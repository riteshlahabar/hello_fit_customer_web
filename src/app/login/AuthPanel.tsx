'use client';

// The demo's `section.auth-wrap`, with its tabs actually switching.
//
// The demo drove these from an inline `<script>` that the parse5 conversion
// dropped, which is why every button on this page did nothing. Same markup,
// same ids and classes — the behaviour is React now.
//
// Three doors, one of which works: OTP. See `StaticForms.tsx` for why the
// other two are kept but unwired.

import { useState } from 'react';
import { OtpForm } from './OtpForm';
import { LoginForm, RegisterForm } from './StaticForms';

type Tab = 'login' | 'register' | 'otp';

export function AuthPanel() {
  const [tab, setTab] = useState<Tab>('otp');
  const [message, setMessage] = useState<{ text: string; bad: boolean } | null>(null);

  const show = (text: string, bad = false) => setMessage({ text, bad });

  const pick = (next: Tab) => {
    setTab(next);
    setMessage(null);
  };

  return (
    <section className="auth-wrap">
      <div className="auth-head">
        <div className="eyebrow">WELCOME TO HELLOFIT</div>
        <h2 id="authTitle">
          {tab === 'register' ? 'Create your account.' : 'Good to see you again.'}
        </h2>
        <p id="authSubtitle">
          {tab === 'register'
            ? 'Verify your mobile and your account is ready.'
            : 'Sign in to manage your sessions and keep your progress moving.'}
        </p>
      </div>

      <div className="tabs" role="tablist">
        <button
          className={`tab${tab !== 'register' ? ' active' : ''}`}
          id="loginTab"
          role="tab"
          aria-selected={tab !== 'register'}
          onClick={() => pick('otp')}>
          Sign in
        </button>
        <button
          className={`tab${tab === 'register' ? ' active' : ''}`}
          id="registerTab"
          role="tab"
          aria-selected={tab === 'register'}
          onClick={() => pick('register')}>
          Create account
        </button>
      </div>

      {/* `.message` is `display:none` until it also carries `show`
          (page.css:59) — the demo's script added that class and the
          conversion dropped it, so every message rendered invisibly. */}
      <div
        id="message"
        className={
          message ? `message show ${message.bad ? 'error' : 'success'}` : 'message'
        }
        role="status"
        aria-live="polite">
        {message?.text ?? ''}
      </div>

      <div className="social">
        <button
          type="button"
          id="googleBtn"
          onClick={() => show('Google sign-in isn’t available yet.', true)}>
          <span className="google-g">G</span>Continue with Google
        </button>
        <button type="button" id="otpBtn" onClick={() => pick('otp')}>
          ✉ &nbsp; Continue with OTP
        </button>
      </div>

      <div className="divider">
        {tab === 'otp' ? 'OR SIGN IN WITH A PASSWORD' : 'OR CONTINUE WITH EMAIL'}
      </div>

      {tab === 'otp' ? <OtpForm onMessage={show} /> : null}
      <LoginForm hidden={tab !== 'login'} onMessage={show} />
      <RegisterForm hidden={tab !== 'register'} onMessage={show} />

      {/* Centred to sit on the same axis as the "Create an account" line below
          it. The button is inline-block, so the wrapper's `text-align` is what
          does it — no `display` change, which would alter the box itself. */}
      {tab === 'login' ? null : (
        <div className="switch-link">
          <button type="button" className="text-link" onClick={() => pick('login')}>
            Use email and password instead
          </button>
        </div>
      )}

      <div className="footer-note">
        New to HelloFit?{' '}
        <button type="button" className="text-link" onClick={() => pick('register')}>
          Create an account
        </button>
      </div>
    </section>
  );
}
