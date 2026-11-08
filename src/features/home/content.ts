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
    'I build web apps and like getting the details right, from what you see on screen to what happens when you hit submit.',
  primaryCta: {
    label: 'See my work',
    href: '#work'
  },
  secondaryCta: {
    label: 'Get in touch',
    href: '#contact'
  },

  profileImage: {
    src: '/hero-dither.png',
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
  eyebrow: 'Impact',
  title: 'A few results from my work.',
  items: [
    {
      metric: '25+ issues caught early',
      context: 'Found issues in eight online services before users ran into them.'
    },
    {
      metric: '12+ urgent problems fixed',
      context: 'Fixed problems that blocked client work, usually within 24 hours.'
    },
    {
      metric: '4 hours saved each week',
      context: 'Automated more than 15 manual release steps.'
    }
  ]
};

export const journeyContent = {
  title: 'How I got here',
  paragraphs: [
    'I started in mathematics because I liked figuring out why things work. I switched to computer science to build things people could use.'
  ]
};

export const currentFocusContent = {
  intro: 'I’m open to engineering roles and freelance projects.'
};
