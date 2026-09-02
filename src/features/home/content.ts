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
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
  profileImage: {
    src: string;
    alt: string;
  };
  socialLinks: HomeSocialLink[];
}

export interface ImpactSnapshotItem {
  metric: string;
  context: string;
  sourceLabel: string;
  sourceHref: `#${string}`;
  sourceExperienceId: string;
}

export interface ImpactSnapshotContent {
  eyebrow: string;
  title: string;
  items: ImpactSnapshotItem[];
}

export const heroContent: HeroContent = {
  name: 'John Lester Escarlan',
  role: 'Full-Stack Software Engineer',
  tagline:
    'I help product teams ship full-stack features, fix production bottlenecks, and replace fragile manual workflows with tested automation.',
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

export const impactSnapshotContent: ImpactSnapshotContent = {
  eyebrow: 'Impact snapshot',
  title: 'Recent outcomes, with the work behind them.',
  items: [
    {
      metric: '25+ incidents',
      context:
        'identified and escalated across eight production services before they reached end users.',
      sourceLabel: 'Incident-response experience',
      sourceHref: '#exp-wg-monitoring-engineer',
      sourceExperienceId: 'exp-wg-monitoring-engineer'
    },
    {
      metric: '12+ blockers',
      context:
        'resolved in production with an average turnaround under 24 hours, restoring affected client workflows.',
      sourceLabel: 'Production-fix experience',
      sourceHref: '#exp-freelance-software-engineer',
      sourceExperienceId: 'exp-freelance-software-engineer'
    },
    {
      metric: '15+ release steps',
      context:
        'removed through automation, saving approximately four engineering hours each week.',
      sourceLabel: 'Release-automation experience',
      sourceHref: '#exp-freelance-software-engineer',
      sourceExperienceId: 'exp-freelance-software-engineer'
    }
  ]
};
