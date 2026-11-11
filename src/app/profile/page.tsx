import type { Metadata } from 'next';
import { ProfileAccount } from './ProfileAccount';
import './page.css';

/**
 * Converted from the demo's hellofit-customer-profile-account-settings.html.
 * The markup and styling are the client's design; only the mechanics are React.
 *
 * Everything on this page needs the customer's token, so the whole account
 * shell is the client component — the server has nothing to render here that
 * is not either the shell or a signed-out redirect.
 */

export const metadata: Metadata = {
  title: "HelloFit | Customer Profile & Account Settings",
};

export default function ProfilePage() {
  return (
    <div data-hf-page="profile">
      <ProfileAccount />
      <div className="toast" id="toast"></div>
    </div>
  );
}
