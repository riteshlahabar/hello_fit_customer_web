// The four profile sections that have no API behind them, kept verbatim from
// the client's design and deliberately not wired. Separated into their own
// file so the boundary is visible: everything in here is awaiting a client
// decision, everything in ProfileAccount.tsx is live.
//
// Why each one is unwired:
//
// - **Password & security** — customers authenticate by mobile OTP. There is
//   no customer password to change and no Google provider (`lib/auth.ts`).
// - **Notification preferences** — the API stores preferences as
//   (channel, eventKey) pairs over 4 channels and 28 event keys
//   (`notification/events.ts`). The design offers five topics, two of which
//   ("session reminders", "fitness tips") have no event key at all. Mapping
//   one onto the other would be inventing the mapping.
// - **Fitness & app preferences** — no columns. `goal` is the single
//   profile field in this area and it is a free-text string, not this list.
// - **Privacy & account** — no data-export or deletion-request endpoint.
//
// PDF §5.9 asks for "view profile details, update supported profile fields,
// manage addresses" and names none of these, so none is a gap against the
// spec — they are design the client supplied ahead of the backend.

export type StaticSectionId = 'security' | 'notifications' | 'preferences' | 'privacy';

/** The sidebar's choice reaches here, so these open like the live section. */
export function StaticSections({ active }: { active: string }) {
  const on = (id: StaticSectionId) => (active === id ? 'section active' : 'section');

  return (
    <>
      <section className={on("security")} id="security"><div className="panel"><div className="panel-head"><div><h2>Password &amp; security</h2><p>Use a strong password and keep your account protected.</p></div></div><form id="passwordForm"><div className="panel-body"><div className="grid"><div className="field full"><label htmlFor="currentPassword">Current password</label><input type="password" id="currentPassword" placeholder="Enter current password" autoComplete="current-password" /></div><div className="field"><label htmlFor="newPassword">New password</label><input type="password" id="newPassword" minLength={8} placeholder="At least 8 characters" autoComplete="new-password" /></div><div className="field"><label htmlFor="confirmPassword">Confirm new password</label><input type="password" id="confirmPassword" minLength={8} placeholder="Re-enter new password" autoComplete="new-password" /></div></div><div className="security-note">✓ Use at least 8 characters and avoid reusing passwords from other websites. This demo validates the form locally; it does not change a real password.</div></div><div className="actions"><button type="reset" className="btn">Clear</button><button className="btn primary" type="submit">Update password</button></div></form></div><div className="panel"><div className="panel-head"><div><h2>Sign-in methods</h2><p>Manage how you access your account.</p></div></div><div className="panel-body"><div className="setting-row"><div><strong>Email address</strong><p id="securityEmail">You sign in with your mobile number and a one-time code.</p></div><span className="tag">Primary</span></div><div className="setting-row"><div><strong>Google sign-in</strong><p>Connect a Google account for faster sign-in.</p></div><button className="btn" type="button">Connect Google</button></div></div></div></section>

      <section className={on("notifications")} id="notifications"><div className="panel"><div className="panel-head"><div><h2>Notification preferences</h2><p>Choose what you would like to hear from HelloFit about.</p></div></div><div className="panel-body"><div className="setting-row"><div><strong>Booking updates</strong><p>Confirmations, reschedules and cancellations.</p></div><label className="switch"><input type="checkbox" defaultChecked={true} /><span className="slider"></span></label></div><div className="setting-row"><div><strong>Session reminders</strong><p>Helpful reminders before your upcoming session.</p></div><label className="switch"><input type="checkbox" defaultChecked={true} /><span className="slider"></span></label></div><div className="setting-row"><div><strong>Trainer messages</strong><p>Messages and important updates from trainers.</p></div><label className="switch"><input type="checkbox" defaultChecked={true} /><span className="slider"></span></label></div><div className="setting-row"><div><strong>Offers and promotions</strong><p>Occasional discounts, new trainers and special offers.</p></div><label className="switch"><input type="checkbox" /><span className="slider"></span></label></div><div className="setting-row"><div><strong>Product and fitness tips</strong><p>News and ideas to support your fitness journey.</p></div><label className="switch"><input type="checkbox" /><span className="slider"></span></label></div></div><div className="actions"><button className="btn primary">Save preferences</button></div></div></section>

      <section className={on("preferences")} id="preferences"><div className="panel"><div className="panel-head"><div><h2>Fitness &amp; app preferences</h2><p>Personalise the way you use HelloFit.</p></div></div><div className="panel-body"><div className="grid"><div className="field"><label htmlFor="fitnessGoal">Primary fitness goal</label><select id="fitnessGoal"><option>Improve flexibility</option><option>Build strength</option><option>Weight management</option><option>Improve endurance</option><option>Reduce stress</option><option>General wellbeing</option></select></div><div className="field"><label htmlFor="level">Current fitness level</label><select id="level"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div><div className="field"><label htmlFor="sessionType">Preferred session type</label><select id="sessionType"><option>At my home</option><option>Online</option><option>At trainer&apos;s location</option><option>No preference</option></select></div><div className="field"><label htmlFor="language">Preferred language</label><select id="language"><option>English</option><option>हिन्दी (Hindi)</option><option>मराठी (Marathi)</option></select></div><div className="field"><label htmlFor="reminderTime">Session reminder</label><select id="reminderTime"><option>1 hour before</option><option>30 minutes before</option><option>3 hours before</option><option>1 day before</option></select></div><div className="field"><label htmlFor="timezone">Time zone</label><select id="timezone"><option>India Standard Time (IST)</option><option>UTC</option></select></div></div></div><div className="actions"><button className="btn primary">Save preferences</button></div></div></section>

      <section className={on("privacy")} id="privacy"><div className="panel"><div className="panel-head"><div><h2>Privacy &amp; account</h2><p>Review your account options and data preferences.</p></div></div><div className="panel-body"><div className="setting-row"><div><strong>Profile visibility</strong><p>Your profile information is used to support bookings and trainer communication.</p></div><span className="tag">Private</span></div><div className="setting-row"><div><strong>Personalised recommendations</strong><p>Allow HelloFit to use your selected preferences to suggest relevant trainers.</p></div><label className="switch"><input type="checkbox" defaultChecked={true} /><span className="slider"></span></label></div><div className="setting-row"><div><strong>Download my information</strong><p>Request a copy of your profile and account information.</p></div><button className="btn" type="button">Download data</button></div><div className="danger-zone"><div><strong>Delete account</strong><p>This is a demo only. No account will be deleted.</p></div><button className="btn danger" type="button">Request account deletion</button></div></div></div></section>
    </>
  );
}
