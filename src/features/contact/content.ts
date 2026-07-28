export interface ContactContent {
  eyebrow: string;
  title: string;
  intro: string;
  prompt: string;
  email: string;
  primaryCtaLabel: string;
  resumeLabel: string;
  resumeHref: string;
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

export const contactContent: ContactContent = {
  eyebrow: 'Contact',
  title: 'Need a full-stack feature shipped or a fragile workflow fixed?',
  intro:
    'Send the problem, your current stack, and the outcome or timeline you are working toward. I will reply within 48 hours with whether I can help and a practical next step.',
  prompt: 'Freelance and contract inquiries',
  email: resolveContactEmail(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  primaryCtaLabel: 'Discuss a project',
  resumeLabel: 'View résumé',
  resumeHref: '/John_Lester_Escarlan_Resume.pdf'
};
