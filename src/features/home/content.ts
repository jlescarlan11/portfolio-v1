import { contactContent } from '@/features/contact/content';

export interface HomeSocialLink {
  platform: string;
  url: string;
  label: string;
}

export interface HeroCta {
  label: string;
  href: string;
}

export interface HeroContent {
  name: string;
  role: string;
  tagline: string;
  services: string[];
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
  profileImage: {
    src: string;
    alt: string;
  };
  socialLinks: HomeSocialLink[];
}

export const heroContent: HeroContent = {
  name: 'John Lester Escarlan',
  role: 'Full-Stack Software Engineer',
  tagline:
    'I help product teams ship full-stack features, fix production bottlenecks, and replace fragile manual workflows with tested automation.',
  services: [
    'Full-stack product delivery',
    'Production debugging and reliability',
    'Workflow automation and integrations'
  ],
  primaryCta: {
    label: 'Discuss a project',
    href: '#contact'
  },
  secondaryCta: {
    label: 'Review case studies',
    href: '#work'
  },

  profileImage: {
    src: '/hero-image.jpg',
    alt: 'Portrait of John Lester Escarlan'
  },
  socialLinks: [
    {
      platform: 'GitHub',
      url: 'https://github.com/jlescarlan11',
      label: 'GitHub profile'
    },
    {
      platform: 'LinkedIn',
      url: 'https://www.linkedin.com/in/john-lester-escarlan/',
      label: 'LinkedIn profile'
    },
    {
      platform: 'HackerRank',
      url: 'https://www.hackerrank.com/profile/jlescarlan11',
      label: 'HackerRank profile'
    },
    {
      platform: 'Email',
      url: `mailto:${contactContent.email}`,
      label: 'Send an email to John Lester Escarlan'
    }
  ]
};
