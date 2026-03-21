'use client';

import type { HeroContent } from '@/features/home/content';
import ProfileImage from '@/features/home/components/ProfileImage';
import SocialLinks from '@/features/home/components/SocialLinks';
import { Typography } from '@/shared/components/Typography';
import { FadeIn } from '@/shared/components/FadeIn';

export default function HeroSection({
  name,
  role,
  tagline,
  profileImage: { src, alt },
  socialLinks
}: HeroContent): React.JSX.Element {
  // Stagger delays — name anchors first, everything else follows
  const d = {
    name: 0,
    role: 100,
    tagline: 220,
    social: 360,
    image: 80,
    scroll: 600
  };

  // Trim tagline to first sentence for above-the-fold punch
  const shortTagline = tagline.split(/[.!?]/)[0].trim();

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden bg-surface"
      aria-labelledby="hero-heading"
    >
      {/* Grid texture — fades toward bottom so it doesn't compete with content below */}
      <div
        className="surface-grid-mask pointer-events-none-safe absolute inset-0"
        aria-hidden="true"
      />

      {/* ── Main grid ── */}
      <div
        className={[
          'relative z-10 mx-auto grid min-h-screen w-full max-w-5xl',
          'grid-cols-1 lg:grid-cols-[1fr_auto]',
          'items-center',
          'px-6 sm:px-10 md:px-12',
          'gap-12 pt-28 pb-24',
          'lg:gap-16 lg:pt-0 lg:pb-0'
        ].join(' ')}
      >
        {/* ── Left: text content ── */}
        <div className="order-2 flex flex-col gap-7 lg:order-1 lg:justify-center lg:pr-12">

          {/* Name — always lands first, fluid size */}
          <FadeIn delay={d.name}>
            <Typography
              variant="display"
              as="h1"
              id="hero-heading"
              className="font-black leading-[1.0] tracking-tight"
              style={{ fontSize: 'clamp(2.5rem, 6.5vw, 4.5rem)' }}
            >
              {name}
            </Typography>
          </FadeIn>

          {/* Role — pill tag treatment, not plain eyebrow */}
          <FadeIn delay={d.role}>
            <span className="inline-flex items-center gap-2.5">
              {/* Animated availability dot */}
              <span className="relative flex h-2 w-2 flex-shrink-0" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping bg-foreground opacity-20" />
                <span className="relative inline-flex h-2 w-2 bg-foreground/40" />
              </span>
              <Typography
                variant="caption"
                as="span"
                className="text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground"
              >
                {role}
              </Typography>
            </span>
          </FadeIn>

          {/* Tagline — first sentence only, comfortable reading width */}
          <FadeIn delay={d.tagline}>
            <Typography
              variant="body-lg"
              as="p"
              className="max-w-md leading-relaxed text-muted-foreground"
            >
              {shortTagline}.
            </Typography>
          </FadeIn>

          {/* Social links */}
          <FadeIn delay={d.social}>
            <SocialLinks links={socialLinks} />
          </FadeIn>
        </div>

        {/* ── Right: profile image ── */}
        <FadeIn
          delay={d.image}
          className="relative order-1 flex items-center justify-start lg:order-2 lg:justify-end"
        >
          {/*
            Architectural offset border — a single square border displaced
            by 12px down-right. Feels considered, not decorative.
          */}
          <div className="relative">
            {/* Offset border — sits behind the image */}
            <div
              className="absolute border border-surface-border"
              style={{
                inset: 0,
                transform: 'translate(12px, 12px)',
                zIndex: 0
              }}
              aria-hidden="true"
            />

            {/* Image container — sits above the border */}
            <div
              className="relative z-10 overflow-hidden bg-surface-muted"
              style={{ width: 'clamp(160px, 28vw, 300px)', aspectRatio: '1/1' }}
            >
              <ProfileImage src={src} alt={alt} />
            </div>
          </div>
        </FadeIn>
      </div>

      {/* ── Scroll indicator ── */}
      <FadeIn
        delay={d.scroll}
        className="absolute bottom-8 left-6 hidden flex-col items-start gap-3 sm:flex sm:left-10 md:left-12"
        aria-hidden="true"
      >
        <Typography
          variant="caption"
          as="span"
          className="text-[10px] font-semibold uppercase tracking-[0.15em] text-subtle-foreground/60"
        >
          scroll
        </Typography>
        {/* Animated line — draws down on load */}
        <span
          className="block w-px bg-foreground/20 animate-enter"
          style={{ height: '48px', '--enter-delay': '700ms' } as React.CSSProperties}
        />
      </FadeIn>

    
    </section>
  );
}