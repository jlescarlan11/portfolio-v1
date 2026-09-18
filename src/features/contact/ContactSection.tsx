import type { ContactContent } from '@/features/contact/content';
import SectionFrame from '@/shared/components/SectionFrame';
import { Typography } from '@/shared/components/Typography';
import { FadeIn } from '@/shared/components/FadeIn';
import { NewTabNotice } from '@/shared/components/NewTabNotice';
import { TYPOGRAPHY_STYLES } from '@/shared/styles/shared';
import { CopyEmailButton } from './CopyEmailButton';

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
        {/* ── Inquiry scope; intentionally not a current-availability signal ── */}
        <div className="mb-8">
          <Typography
            variant="caption"
            as="span"
            className="text-base font-medium uppercase tracking-[0.12em] text-subtle-foreground"
          >
            {content.prompt}
          </Typography>
        </div>

        {/* ── Primary CTA — full-width on mobile, auto on desktop ── */}
        <div className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={`mailto:${content.email}`}
              className="group inline-flex min-h-11 w-full items-center justify-between border border-foreground px-6 py-4 transition-all duration-200 hover:bg-foreground hover:text-background sm:w-auto sm:min-w-64 sm:justify-start sm:gap-4"
            >
              <Typography
                variant="label"
                as="span"
                className="font-medium transition-colors duration-200 group-hover:text-background"
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

            {content.booking.url ? (
              <a
                href={content.booking.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-11 w-full items-center justify-between border border-surface-divider px-6 py-4 transition-colors duration-200 hover:border-foreground sm:w-auto sm:min-w-72 sm:justify-start sm:gap-4"
              >
                <span className="flex flex-col gap-0.5">
                  <Typography variant="label" as="span" className="font-medium">
                    {content.booking.label}
                  </Typography>
                  <Typography variant="caption" as="span" className="text-subtle-foreground">
                    {content.booking.duration}
                  </Typography>
                </span>
                <span aria-hidden="true" className="opacity-50 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100">
                  ↗
                </span>
                <NewTabNotice />
              </a>
            ) : null}
          </div>
        </div>

        {/* ── Secondary actions row ── */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <CopyEmailButton email={content.email} />

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
            <NewTabNotice />
          </a>
        </div>
      </FadeIn>
    </SectionFrame>
  );
}
