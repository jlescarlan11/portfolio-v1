'use client';

import type { CSSProperties } from 'react';
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
  const d = {
    role: 320,
    tagline: 440,
    social: 560,
    image: 80,
    scroll: 700
  };

  const taglineMatch = tagline.match(/^([^.!?]+)([.!?])/);
  const shortTagline = taglineMatch
    ? taglineMatch[1].trim() + taglineMatch[2]
    : tagline.split(/[.!?]/)[0].trim() + '.';
  const nameWords = name.split(' ');

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden bg-surface"
      aria-labelledby="hero-heading"
    >
      <div
        className="surface-grid-mask pointer-events-none-safe absolute inset-0"
        aria-hidden="true"
        style={{ '--surface-border-dim': 'rgba(var(--foreground-rgb), 0.14)' } as CSSProperties}
      />

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

          {/* Name — word-by-word entrance */}
          <h1
            id="hero-heading"
            className="font-black leading-[1.0] tracking-tight font-serif"
            style={{ fontSize: 'clamp(2rem, 5.5vw, 3.75rem)' }}
          >
            {nameWords.map((word, i) => (
              <span
                key={i}
                className="inline-block animate-enter"
                style={{ '--enter-delay': `${i * 80}ms` } as CSSProperties}
              >
                {word}
                {i < nameWords.length - 1 && <>&nbsp;</>}
              </span>
            ))}
          </h1>

          {/* Role */}
          <FadeIn delay={d.role}>
            <span className="inline-flex items-center gap-2.5">
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

          {/* Tagline */}
          <FadeIn delay={d.tagline}>
            <Typography
              variant="body-lg"
              as="p"
              className="max-w-lg leading-relaxed text-muted-foreground"
            >
              {shortTagline}
            </Typography>
          </FadeIn>

          {/* Social links */}
          <FadeIn delay={d.social}>
            <SocialLinks links={socialLinks} />
          </FadeIn>
        </div>

        {/* ── Right: profile image with corner brackets ── */}
        <FadeIn
          delay={d.image}
          className="relative order-1 flex items-center justify-start lg:order-2 lg:justify-end"
        >
          <div className="relative">
            {/* Top-left corner bracket */}
            <span
              className="absolute -top-2 -left-2 z-20 h-5 w-5 border-l border-t border-foreground/40 pointer-events-none"
              aria-hidden="true"
            />
            {/* Bottom-right corner bracket */}
            <span
              className="absolute -bottom-2 -right-2 z-20 h-5 w-5 border-r border-b border-foreground/40 pointer-events-none"
              aria-hidden="true"
            />

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
        <span
          className="block w-px overflow-hidden"
          style={{ height: '48px' }}
        >
          <span
            className="block h-full w-full bg-foreground/20 origin-top"
            style={{
              animation: 'draw-down 1.2s ease-out 0.7s both',
              transformOrigin: 'top'
            }}
          />
        </span>
      </FadeIn>
    </section>
  );
}
