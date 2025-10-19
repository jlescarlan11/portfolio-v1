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
      className="min-h-screen flex items-center justify-center px-6 md:px-12 bg-black py-12"
      aria-label="Hero section"
    >
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        <div className="flex flex-col justify-center lg:justify-between gap-6 lg:gap-8 order-2 md:order-1">
          <div className="space-y-4 md:space-y-6 text-center lg:text-left">
            <h1 
              ref={nameRef} 
              className="text-3xl sm:text-4xl lg:text-5xl font-light text-white" 
              style={ANIMATION_STYLES.fadeInOpacity}
            >
              {name}
            </h1>
            <h2 
              ref={roleRef} 
              className="text-xl sm:text-2xl lg:text-2xl text-gray-300 italic" 
              style={ANIMATION_STYLES.fadeInOpacity}
            >
              {role}
            </h2>
            <p 
              ref={taglineRef} 
              className="text-base sm:text-lg lg:text-lg lg:border-l-2 lg:pl-4 text-gray-400 max-w-lg mx-auto lg:mx-0" 
              style={ANIMATION_STYLES.fadeInOpacity}
            >
              {tagline}
            </p>
          </div>
          <div ref={socialRef} className="flex justify-center lg:justify-start" style={ANIMATION_STYLES.fadeInOpacity}>
            <SocialLinks links={socialLinks} />
          </div>
        </div>
        <div ref={imageRef} className="flex justify-center lg:justify-end order-1 lg:order-2" style={ANIMATION_STYLES.fadeInOpacity}>
          <ProfileImage 
            src={src}
            alt={alt}
          />
        </div>
      </div>
    </section>
  );
}
