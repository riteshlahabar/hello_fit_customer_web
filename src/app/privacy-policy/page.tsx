import type { Metadata } from 'next';
import { PolicyPage } from '@/components/PolicyPage';

export const metadata: Metadata = {
  title: 'Privacy Policy | HelloFit',
};

export default function PrivacyPolicy() {
  return (
    <PolicyPage
      title="Privacy Policy"
      intro="How HelloFit collects, uses and protects your personal information."
      sections={[
        'What information we collect, and when',
        'How your information is used',
        'Who it is shared with — trainers, payment and messaging providers',
        'Location and address data used for home-service bookings',
        'Cookies and analytics',
        'How long information is kept',
        'Your rights, and how to exercise them',
        'How to contact HelloFit about privacy',
      ]}
    />
  );
}
