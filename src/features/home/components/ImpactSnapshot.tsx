import Link from 'next/link';
import type { ImpactSnapshotContent } from '@/features/home/content';
import { Typography } from '@/shared/components/Typography';
import { TYPOGRAPHY_STYLES } from '@/shared/styles/shared';

export default function ImpactSnapshot({
  eyebrow,
  title,
  items
}: ImpactSnapshotContent): React.JSX.Element {
  return (
    <section
      className="border-t border-surface-subtle bg-surface px-6 py-10 sm:px-10 md:px-12 md:py-12"
      aria-labelledby="impact-snapshot-heading"
    >
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,14rem)_1fr] lg:items-start">
        <header className="space-y-3">
          <Typography
            variant="caption"
            as="p"
            className={TYPOGRAPHY_STYLES.eyebrow}
          >
            {eyebrow}
          </Typography>
          <Typography
            variant="h3"
            as="h2"
            id="impact-snapshot-heading"
            className="max-w-sm"
          >
            {title}
          </Typography>
        </header>

        <dl className="grid grid-cols-1 gap-px bg-surface-divider sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={`${item.metric}-${item.sourceExperienceId}`}
              className="flex min-w-0 flex-col bg-surface px-0 py-5 sm:px-5 sm:first:pl-0 sm:last:pr-0"
            >
              <Typography variant="h4" as="dt" className="font-semibold">
                {item.metric}
              </Typography>
              <Typography
                variant="body-sm"
                as="dd"
                className="mt-2 flex-1 leading-relaxed text-muted-foreground"
              >
                {item.context}
              </Typography>
              <Link
                href={item.sourceHref}
                className={`${TYPOGRAPHY_STYLES.linkSecondary} mt-4 inline-flex min-h-11 w-fit items-center gap-1.5 py-2`}
              >
                {item.sourceLabel}
                <span aria-hidden="true">↓</span>
              </Link>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
