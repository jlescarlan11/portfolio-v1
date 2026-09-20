import { isRenderableExternalUrl } from '@/shared/lib/project';

export interface BookingDetails {
  url: string | null;
  label: string;
}

export interface ContactContent {
  eyebrow: string;
  title: string;
  intro: string;
  prompt: string;
  email: string;
  primaryCtaLabel: string;
  resumeLabel: string;
  resumeHref: string;
  booking: BookingDetails;
}

const DEFAULT_CONTACT_EMAIL = 'jlescarlan11@gmail.com';
const CONTACT_EMAIL_PATTERN = /^[^\s@/?#]+@[^\s@/?#]+\.[^\s@/?#]+$/;

function resolveContactEmail(value: string | undefined): string {
  const candidate = value?.trim();
  return candidate &&
    candidate.length <= 254 &&
    CONTACT_EMAIL_PATTERN.test(candidate)
    ? candidate
    : DEFAULT_CONTACT_EMAIL;
}

export function resolveBookingUrl(value: string | undefined): string | null {
  const candidate = value?.trim();

  if (!candidate || candidate.length > 2_048 || !isRenderableExternalUrl(candidate)) {
    return null;
  }

  return new URL(candidate).href;
}

export const contactContent: ContactContent = {
  eyebrow: 'Contact',
  title: 'Interested in working together?',
  intro:
    'Send the role, project, or problem you have in mind. I will reply within 48 hours, or you can choose a time for a short introductory call.',
  prompt: 'Employment, freelance, and contract inquiries',
  email: resolveContactEmail(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  primaryCtaLabel: 'Discuss a project',
  resumeLabel: 'View résumé',
  resumeHref: '/John_Lester_Escarlan_Resume.pdf',
  booking: {
    url: resolveBookingUrl(process.env.NEXT_PUBLIC_BOOKING_URL),
    label: 'Schedule an introductory call'
  }
};
