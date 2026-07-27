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
  title: 'Open to software engineering roles and product-focused collaborations.',
  intro:
    'If you need someone who can ship across the stack, reason clearly about systems, and improve reliability along the way, send an email. I usually reply within 48 hours.',
  prompt: 'Start with an email',
  email: resolveContactEmail(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  primaryCtaLabel: 'Send Email',
  resumeLabel: 'View Resume',
  resumeHref: '/John_Lester_Escarlan_Resume.pdf'
};
