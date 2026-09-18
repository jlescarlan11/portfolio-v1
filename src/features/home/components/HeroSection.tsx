import React from 'react';
import { FiArrowDown, FiArrowUpRight } from 'react-icons/fi';
import type { HeroContent } from '@/features/home/content';
import ProfileImage from './ProfileImage';

export default function HeroSection({
  role,
  primaryCta,
  profileImage,
  socialLinks
}: HeroContent): React.JSX.Element {
  return (
    <section id="about" aria-labelledby="hero-heading" className="portfolio-hero portfolio-container">
      <span id="home" className="scroll-mt-28" />
      <div className="hero-copy">
        <h1 id="hero-heading" className="h1">Hi, I’m John.</h1>
        <p className="mt-2 font-medium">{role}</p>
        <p className="mt-5 max-w-lg text-muted-foreground leading-7">I study Computer Science at the University of the Philippines and work across client delivery and production monitoring. I build full-stack features and automate repetitive workflows.</p>
        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-4">
          <a href={primaryCta.href} className="portfolio-button">
            <FiArrowDown aria-hidden="true" />
            {primaryCta.label}
          </a>
          {socialLinks.filter(link => ['GitHub', 'LinkedIn'].includes(link.platform)).map(link => <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" className="portfolio-link">{link.platform}<FiArrowUpRight aria-hidden="true" /></a>)}
          <a href="/John_Lester_Escarlan_Resume.pdf" target="_blank" rel="noopener noreferrer" className="portfolio-link">Résumé<FiArrowUpRight aria-hidden="true" /></a>
        </div>
      </div>
      <ProfileImage src={profileImage.src} alt={profileImage.alt} className="hero-portrait" />
    </section>
  );
}
