'use client';

import { useRef } from 'react';
import ProfileImage from './ProfileImage';
import SocialLinks from './SocialLinks';
import { useStaggeredFadeIn } from '../hooks/useStaggeredFadeIn';
import { ANIMATION_STYLES } from '../styles/shared';

interface HeroSectionProps {
  name: string;
  role: string;
  tagline: string;
  profileImage: {
    src: string;
    alt: string;
  };
  socialLinks: Array<{
    platform: string;
    url: string;
    label: string;
  }>;
}

export default function HeroSection({
  name,
  role,
  tagline,
  profileImage: { src, alt },
  socialLinks
}: HeroSectionProps) {
  const nameRef = useRef<HTMLHeadingElement>(null);
  const roleRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Use the staggered animation hook for all elements
  useStaggeredFadeIn({
    textRefs: [nameRef, roleRef, taglineRef],
    socialRef,
    imageRef,
  });

  return (
    <section 
      className="min-h-screen flex items-center justify-center px-6 md:px-12 bg-black py-16 md:py-24"
      aria-label="Hero section"
    >
      <div className={`max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12`}>
        <div className="flex flex-col justify-center lg:justify-between gap-6 lg:gap-8 order-2 md:order-1">
          <div className="space-y-4 md:space-y-6 text-center lg:text-left">
            <h1 
              ref={nameRef} 
              className={`text-4xl sm:text-5xl lg:text-7xl font-light tracking-tight leading-[0.95] text-white ${ANIMATION_STYLES.fadeInOpacity}`}
            >
              {name}
            </h1>
            <h2 
              ref={roleRef} 
              className={"text-xs sm:text-sm uppercase tracking-[0.3em] text-white/70"} 
              style={ANIMATION_STYLES.fadeInOpacity}
            >
              {role}
            </h2>
            <p 
              ref={taglineRef} 
              className="text-sm sm:text-base lg:text-base lg:border-l lg:pl-4 border-white/10 text-white/60 max-w-lg mx-auto lg:mx-0" 
              style={ANIMATION_STYLES.fadeInOpacity}
            >
              {tagline}
            </p>
          </div>
          <div ref={socialRef} className="flex justify-center lg:justify-start" style={ANIMATION_STYLES.fadeInOpacity}>
            <SocialLinks links={socialLinks} />
          </div>
        </div>
        <div ref={imageRef} className="flex justify-center lg:justify-end order-1 lg:order-2 pr-0 lg:pr-6" style={ANIMATION_STYLES.fadeInOpacity}>
          <ProfileImage 
            src={src}
            alt={alt}
          />
        </div>
      </div>
    </section>
  );
}
