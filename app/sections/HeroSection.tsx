'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'motion';
import ProfileImage from './ProfileImage';
import SocialLinks from './SocialLinks';

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

  useEffect(() => {
    // Animate text elements with stagger
    const textElements = [nameRef.current, roleRef.current, taglineRef.current].filter(Boolean);
    
    if (textElements.length > 0) {
      animate(
        textElements,
        { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0)'] },
        { duration: 0.8, delay: stagger(0.15) }
      );
    }

    // Animate social links
    if (socialRef.current) {
      animate(
        socialRef.current,
        { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0)'] },
        { duration: 0.8, delay: 0.6 }
      );
    }

    // Animate profile image
    if (imageRef.current) {
      animate(
        imageRef.current,
        { opacity: [0, 1], transform: ['scale(0.9)', 'scale(1)'] },
        { duration: 1, delay: 0.3 }
      );
    }
  }, []);

  return (
    <section 
      className="min-h-screen flex items-center justify-center px-6 md:px-12 bg-black py-12"
      aria-label="Hero section"
    >
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 ">
        <div className="flex flex-col justify-center lg:justify-between gap-6 lg:gap-8 order-2 md:order-1">
          <div className="space-y-4 md:space-y-6 text-center lg:text-left">
            <h1 ref={nameRef} className="text-3xl sm:text-4xl lg:text-5xl font-light" style={{ opacity: 0 }}>
              {name}
            </h1>
            <h2 ref={roleRef} className="text-xl sm:text-2xl lg:text-2xl italic" style={{ opacity: 0 }}>
              {role}
            </h2>
            <p ref={taglineRef} className="text-base sm:text-lg lg:text-lg lg:border-l-2 lg:pl-4 text-gray-400 max-w-lg mx-auto lg:mx-0" style={{ opacity: 0 }}>
              {tagline}
            </p>
          </div>
          <div ref={socialRef} className="flex justify-center lg:justify-start" style={{ opacity: 0 }}>
            <SocialLinks links={socialLinks} />
          </div>
        </div>
        <div ref={imageRef} className="flex justify-center lg:justify-end order-1 lg:order-2" style={{ opacity: 0 }}>
          <ProfileImage 
            src={src}
            alt={alt}
          />
        </div>
      </div>
    </section>
  );
}
