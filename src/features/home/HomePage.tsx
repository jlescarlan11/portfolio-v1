import React from 'react';
import ExperienceSection from '@/features/about/ExperienceSection';
import { aboutContent } from '@/features/about/content';
import FooterSection from './components/FooterSection';
import HeroSection from './components/HeroSection';
import { currentFocusContent, heroContent, journeyContent } from './content';
import { getHomepageProjects } from '@/features/projects/lib/projects';
import ProjectDeck from '@/features/projects/components/ProjectDeck';
import NavigationBar from '@/shared/components/NavigationBar';
import { siteConfig } from '@/shared/site/config';
import ContactSection from '@/features/contact/ContactSection';
import { contactContent } from '@/features/contact/content';

export default function HomePage(): React.JSX.Element {
  return <>
    <header><NavigationBar items={siteConfig.navigation.header} /></header>
    <main id="main-content" tabIndex={-1}>
      <HeroSection {...heroContent} />
      <ProjectDeck projects={getHomepageProjects().map(({ slug, title, description, listing }) => ({ slug, title, description, listing: { thumbnail: listing.thumbnail } }))} />
      <section id="journey" className="portfolio-container portfolio-section" aria-labelledby="journey-heading">
        <div className="section-heading"><h2 id="journey-heading" className="h2">{journeyContent.title}</h2></div>
        <div className="journey-columns text-muted-foreground">
          <div>
            <p>{journeyContent.paragraphs[0]}</p>
            <p id="focus" className="mt-4 scroll-mt-28">{currentFocusContent.intro}</p>
          </div>
          <div>
            <p>Mathematics, 2022–2025 <span aria-hidden="true">→</span><span className="sr-only">then</span> Computer Science, 2025–present</p>
            <p>University of the Philippines Cebu</p>
          </div>
        </div>
      </section>
      <ExperienceSection content={aboutContent} />
      <ContactSection content={contactContent} />
    </main>
    <FooterSection links={siteConfig.navigation.footer} copyrightName={siteConfig.footer.copyrightName} />
  </>;
}
