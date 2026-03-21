'use client';

import { Typography } from '@/shared/components/Typography';
import { TYPOGRAPHY_STYLES } from '@/shared/styles/shared';

interface SectionFrameProps {
  id?: string;
  headingId?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  compact?: boolean;
  showTopBorder?: boolean;
}

export default function SectionFrame({
  id,
  headingId,
  eyebrow,
  title,
  intro,
  children,
  className = '',
  contentClassName = '',
  compact = false,
  showTopBorder = true
}: SectionFrameProps): React.JSX.Element {
  const rootClasses = [
    'relative overflow-hidden bg-surface scroll-mt-0',
    showTopBorder ? 'border-t border-surface-subtle' : '',
    compact
      ? 'px-6 sm:px-10 md:px-12 pt-16 md:pt-20 pb-8 md:pb-12'
      : 'px-6 sm:px-10 md:px-12 pt-24 md:pt-32 pb-12 md:pb-16',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const contentClasses = [
    'relative z-10 max-w-5xl mx-auto',
    compact ? 'space-y-12 md:space-y-16' : 'space-y-16 md:space-y-20',
    contentClassName
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section id={id} className={rootClasses} aria-labelledby={headingId}>
      <div className={contentClasses}>
        {(title || eyebrow || intro) && (
          <header className="space-y-4 text-left">
            {eyebrow ? (
              <Typography
                variant="caption"
                as="p"
                className={TYPOGRAPHY_STYLES.eyebrow}
              >
                {eyebrow}
              </Typography>
            ) : null}

            {title ? (
              <Typography variant="h2" as="h2" id={headingId} className="max-w-3xl">
                {title}
              </Typography>
            ) : null}

            {intro ? (
              <Typography variant="body-lg" className="max-w-2xl text-muted-foreground">
                {intro}
              </Typography>
            ) : null}
          </header>
        )}

        {children}
      </div>
    </section>
  );
}
