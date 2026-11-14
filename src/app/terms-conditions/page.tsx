import type { Metadata } from 'next';
import { PolicyPage } from '@/components/PolicyPage';

export const metadata: Metadata = {
  title: 'Terms & Conditions | HelloFit',
};

export default function TermsConditions() {
  return (
    <PolicyPage
      title="Terms & Conditions"
      intro="The terms you agree to when booking fitness services through HelloFit."
      sections={[
        'Who may use HelloFit, and account responsibilities',
        'HelloFit’s role as a marketplace between customers and independent providers',
        'Booking, rescheduling and cancellation',
        'Pricing, payment and taxes',
        'Refunds and the cancellation window',
        'Conduct during a home or online session, and safety',
        'Reviews and acceptable content',
        'Liability, disputes and governing law',
      ]}
    />
  );
}
