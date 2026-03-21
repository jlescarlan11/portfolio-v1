import type { ContactContent } from '@/features/contact/content';
import SectionFrame from '@/shared/components/SectionFrame';
import { Typography } from '@/shared/components/Typography';
import { FadeIn } from '@/shared/components/FadeIn';
import { TYPOGRAPHY_STYLES } from '@/shared/styles/shared';

interface ContactSectionProps {
  content: ContactContent;
}

export default function ContactSection({
  content
}: ContactSectionProps): React.JSX.Element {
  return (
    <SectionFrame
      id="contact"
      headingId="contact-heading"
      eyebrow={content.eyebrow}
      title={content.title}
      intro={content.intro}
    >
      <FadeIn
        delay={100}
        className="pt-2"
      >
        {/* ── Availability signal ── */}
        <div className="mb-8 flex items-center gap-2.5">
          <span className="relative flex h-2 w-2 flex-shrink-0" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping bg-foreground opacity-20" />
            <span className="relative inline-flex h-2 w-2 bg-foreground/40" />
          </span>
          <Typography
            variant="caption"
            as="span"
            className="text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground"
          >
            {content.prompt}
          </Typography>
        </div>

        {/* ── Primary CTA — full-width on mobile, auto on desktop ── */}
        <div className="mb-6">
          <a
            href={`mailto:${content.email}`}
            className="group inline-flex w-full items-center justify-between border border-foreground px-6 py-4 transition-all duration-200 hover:bg-foreground hover:text-background sm:w-auto sm:min-w-64 sm:justify-start sm:gap-4"
          >
            <Typography
              variant="label"
              as="span"
              className="font-semibold transition-colors duration-200 group-hover:text-background"
            >
              {content.primaryCtaLabel}
            </Typography>
            <span
              aria-hidden="true"
              className="font-light opacity-50 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
            >
              →
            </span>
          </a>
        </div>

        {/* ── Secondary actions row ── */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {/* Email address — copyable fallback */}
          <Typography
            variant="caption"
            as="span"
            className="font-mono text-[11px] text-subtle-foreground/60 select-all"
            title="Click to select and copy"
          >
            {content.email}
          </Typography>

          <span
            className="hidden h-3 w-px bg-surface-divider sm:block"
            aria-hidden="true"
          />

          {/* Resume link */}
          <a
            href={content.resumeHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`${TYPOGRAPHY_STYLES.linkSecondary} inline-flex items-center gap-1.5`}
          >
            {content.resumeLabel}
            <span aria-hidden="true" className="opacity-50">↗</span>
          </a>
        </div>
      </FadeIn>
    </SectionFrame>
  );
}