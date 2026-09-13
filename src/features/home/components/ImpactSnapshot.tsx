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
      id="impact"
      className="scroll-mt-24 border-y border-surface-subtle bg-surface px-6 py-16 sm:px-10 sm:py-20 md:px-12 md:py-24 lg:py-28"
      aria-labelledby="impact-snapshot-heading"
    >
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,14rem)_1fr] lg:items-start lg:gap-14">
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
              key={item.metric}
              className="flex min-w-0 flex-col bg-surface px-0 py-5 sm:px-5 sm:first:pl-0 sm:last:pr-0"
            >
              <Typography variant="h4" as="dt" className="font-medium">
                {item.metric}
              </Typography>
              <Typography
                variant="body-sm"
                as="dd"
                className="mt-2 flex-1 leading-relaxed text-muted-foreground"
              >
                {item.context}
              </Typography>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
