import type { ContactContent } from '@/features/contact/content';
import SectionFrame from '@/shared/components/SectionFrame';
import { Typography } from '@/shared/components/Typography';
import { FadeIn } from '@/shared/components/FadeIn';
import { NewTabNotice } from '@/shared/components/NewTabNotice';
import { TYPOGRAPHY_STYLES } from '@/shared/styles/shared';
import { RiArrowRightLine, RiExternalLinkLine } from 'react-icons/ri';
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
      className="contact-redesign"
      contentClassName="contact-redesign__content"
    >
      <FadeIn
        delay={100}
        className="contact-redesign__actions"
      >
        {/* ── Inquiry scope; intentionally not a current-availability signal ── */}
        <div className="mb-9">
          <Typography
            variant="caption"
            as="span"
            className="text-base font-medium uppercase tracking-[0.12em] text-subtle-foreground"
          >
            {content.prompt}
          </Typography>
        </div>

        {/* ── Primary CTA — full-width on mobile, auto on desktop ── */}
        <div className="mb-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3">
            <a
              href={`mailto:${content.email}`}
              className="group inline-flex min-h-16 w-full items-center justify-between rounded-xl border border-foreground px-6 py-5 transition-colors duration-200 hover:bg-foreground hover:text-background sm:h-[92px] sm:w-64 sm:shrink-0 sm:py-0"
            >
              <Typography
                variant="label"
                as="span"
                className="font-medium transition-colors duration-200 group-hover:text-background"
              >
                {content.primaryCtaLabel}
              </Typography>
              <RiArrowRightLine
                aria-hidden="true"
                className="size-5 opacity-45 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
              />
            </a>

            {content.booking.url ? (
              <a
                href={content.booking.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-16 w-full items-center justify-between rounded-xl border border-surface-strong px-6 py-5 transition-colors duration-200 hover:border-foreground sm:h-[92px] sm:w-[312px] sm:shrink-0 sm:py-0"
              >
                <Typography variant="label" as="span" className="font-medium">
                  {content.booking.label}
                </Typography>
                <RiExternalLinkLine
                  aria-hidden="true"
                  className="size-5 opacity-45 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                />
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
            className={`${TYPOGRAPHY_STYLES.linkSecondary} group inline-flex items-center gap-1.5`}
          >
            {content.resumeLabel}
            <RiExternalLinkLine
              aria-hidden="true"
              className="size-5 opacity-50 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
            <NewTabNotice />
          </a>
        </div>
      </FadeIn>
    </SectionFrame>
  );
}
