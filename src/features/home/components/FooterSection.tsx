import Link from 'next/link';
import { Typography } from '@/shared/components/Typography';
import type { NavItem } from '@/shared/site/config';

interface FooterSectionProps {
  links: NavItem[];
  copyrightName: string;
}

export default function FooterSection({
  links,
  copyrightName
}: FooterSectionProps): React.JSX.Element {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-surface bg-surface px-6 py-10 sm:px-10 md:px-12">
      <div className="mx-auto max-w-5xl">

        {/* ── Top row: identity left, nav right ── */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

          {/* Identity anchor — name + role, mirrors the hero */}
          <div>
            <Typography
              variant="label"
              as="p"
              className="font-medium text-foreground"
            >
              {copyrightName}
            </Typography>
            <Typography
              variant="caption"
              as="p"
              className="mt-1 text-base text-subtle-foreground"
            >
              Full-Stack Software Engineer
            </Typography>
          </div>

          {/* Nav links */}
          <nav aria-label="footer navigation">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-base text-subtle-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* ── Bottom row: divider + copyright ── */}
        <div className="flex items-center gap-4 pt-2">
          <Typography
            variant="caption"
            as="span"
            className="text-base text-subtle-foreground"
          >
            &copy; {year} {copyrightName}. All rights reserved.
          </Typography>
        </div>

      </div>
    </footer>
  );
}