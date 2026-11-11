'use client';

// The demo's `#loginForm` and `#registerForm`, markup unchanged.
//
// **Neither is wired, on purpose.** The backend has no customer
// email/password login and no registration endpoint — a customer account is
// created by verifying an OTP (`auth.service.ts` inserts the profile on first
// verify), and password login exists for administrators only.
//
// They are kept rather than removed because the design is the client's and
// PDF §3.1 says "login using the **agreed** authentication method" without
// naming one. Submitting either explains the situation and points at the OTP
// tab, which is honest; a form that silently does nothing is what was there
// before and is what made the page look broken.

const explain = (onMessage: (text: string, bad?: boolean) => void) => (event: React.FormEvent) => {
  event.preventDefault();
  onMessage('Password sign-in isn’t available yet. Use "Continue with OTP" instead.', true);
};

export function LoginForm({
  hidden,
  onMessage,
}: {
  hidden: boolean;
  onMessage: (text: string, bad?: boolean) => void;
}) {
  return (
    <form
      id="loginForm"
      className="form-view"
      hidden={hidden}
      noValidate={true}
      onSubmit={explain(onMessage)}>
      <div className="field">
        <label htmlFor="loginEmail">Email address</label>
        <input id="loginEmail" type="email" autoComplete="email" placeholder="you@example.com" />
      </div>
      <div className="field">
        <label htmlFor="loginPassword">Password</label>
        <div className="input-wrap">
          <input
            id="loginPassword"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
          />
        </div>
      </div>
      <div className="rowline">
        <label className="check">
          <input type="checkbox" id="remember" /> Keep me signed in
        </label>
      </div>
      <button className="submit" type="submit">
        SIGN IN &nbsp;&nbsp;→
      </button>
      <p className="legal">
        By continuing, you agree to our{' '}
        <a className="text-link" href="#terms">
          Terms of Service
        </a>{' '}
        and{' '}
        <a className="text-link" href="#privacy">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}

export function RegisterForm({
  hidden,
  onMessage,
}: {
  hidden: boolean;
  onMessage: (text: string, bad?: boolean) => void;
}) {
  return (
    <form
      id="registerForm"
      className="form-view"
      hidden={hidden}
      noValidate={true}
      onSubmit={(event) => {
        event.preventDefault();
        // Verifying an OTP on an unknown mobile *is* registration here, so
        // this points at the door that works rather than refusing outright.
        onMessage('Accounts are created by verifying your mobile. Use "Continue with OTP".');
      }}>
      <div className="field">
        <label htmlFor="fullName">Full name</label>
        <input id="fullName" autoComplete="name" placeholder="Your full name" />
      </div>
      <div className="field">
        <label htmlFor="registerEmail">Email address</label>
        <input id="registerEmail" type="email" autoComplete="email" placeholder="you@example.com" />
      </div>
      <div className="field">
        <label htmlFor="phone">Mobile number</label>
        <input id="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="10-digit mobile number" />
      </div>
      <div className="field">
        <label htmlFor="registerPassword">Create password</label>
        <div className="input-wrap">
          <input
            id="registerPassword"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />
        </div>
      </div>
      <div className="rowline">
        <label className="check">
          <input id="agree" type="checkbox" /> I agree to the{' '}
          <a href="#terms" className="text-link">
            Terms
          </a>{' '}
          and{' '}
          <a href="#privacy" className="text-link">
            Privacy Policy
          </a>
          .
        </label>
      </div>
      <button className="submit" type="submit">
        CREATE MY ACCOUNT &nbsp;&nbsp;→
      </button>
      <p className="legal">
        Your details are used to manage your HelloFit account and bookings.
      </p>
    </form>
  );
}
