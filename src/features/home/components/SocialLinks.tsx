'use client';

import { SiGithub, SiGmail, SiHackerrank, SiLinkedin } from 'react-icons/si';
import type { HomeSocialLink } from '@/features/home/content';

interface SocialLinksProps {
  links: HomeSocialLink[];
  className?: string;
}

const icons = {
  GitHub: <SiGithub className="size-6" />,
  LinkedIn: <SiLinkedin className="size-6" />,
  Email: <SiGmail className="size-6" />,
  HackerRank: <SiHackerrank className="size-6" />
} as const;

function getIcon(platform: string): React.JSX.Element | null {
  return icons[platform as keyof typeof icons] ?? null;
}

function SocialLinkItem({ link }: { link: HomeSocialLink }): React.JSX.Element {
  const isExternal = link.url.startsWith('http');

  return (
    <li>
      <a
        href={link.url}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="group relative inline-flex h-11 w-11 items-center justify-center border border-transparent text-muted-foreground transition-all duration-300 hover:-translate-y-1 hover:scale-[1.04] hover:border-surface hover:text-foreground"
        aria-label={link.label}
        title={link.platform}
      >
        <span className="inline-flex items-center justify-center [&>svg]:h-5 [&>svg]:w-5" aria-hidden="true">
          {getIcon(link.platform)}
        </span>
        <span className="caption pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap border border-surface bg-surface-muted px-3 py-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {link.platform}
        </span>
      </a>
    </li>
  );
}

export default function SocialLinks({
  links,
  className = ''
}: SocialLinksProps): React.JSX.Element {
  return (
    <nav className={className} aria-label="social">
      <ul className="flex gap-6">
        {links.map((link) => (
          <SocialLinkItem key={link.platform} link={link} />
        ))}
      </ul>
    </nav>
  );
}
