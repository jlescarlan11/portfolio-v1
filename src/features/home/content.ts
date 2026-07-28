import { contactContent } from '@/features/contact/content';

export interface HomeSocialLink {
  platform: string;
  url: string;
  label: string;
}

export interface HeroContent {
  name: string;
  role: string;
  tagline: string;
  profileImage: {
    src: string;
    alt: string;
  };
  socialLinks: HomeSocialLink[];
}

export const heroContent: HeroContent = {
  name: 'John Lester Escarlan',
  role: 'Full-Stack Software Engineer',

  // Trimmed to one clear sentence — the component further trims to first sentence
  // so keep this punchy and direct. No filler phrases.
  tagline:
    'I build reliable full-stack products and guarded automation systems — from marketplaces and offline-first tools to AI-assisted workflows.',

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
