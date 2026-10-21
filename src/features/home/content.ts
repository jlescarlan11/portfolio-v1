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
    'I’m John, a developer with a background in mathematics. I like figuring things out and turning ideas into useful software.',
  primaryCta: {
    label: 'Explore my work',
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
    'I started in mathematics because I liked working through problems and understanding why things work. That curiosity eventually led me to computer science, where I could take an idea, build it, and see someone use it.',
    'What keeps me interested is the mix of problem-solving and making things. I enjoy getting a stubborn feature to work, making an interface easier to use, and learning whatever the next challenge calls for.'
  ],
  transition: 'Those interests have taken different forms in my work: supporting learners, making pricing clearer, and building with a team.'
};

export const currentFocusContent = {
  title: 'What comes next',
  intro: 'I’m continuing my Computer Science studies at UP Cebu, and looking for opportunities to contribute, take ownership, and learn alongside others. I’m open to engineering roles and freelance projects.'
};
