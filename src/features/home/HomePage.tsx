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
      <section id="journey" className="portfolio-container portfolio-section" aria-labelledby="journey-heading">
        <div className="section-heading"><h2 id="journey-heading" className="h2">{journeyContent.title}</h2></div>
        <div className="journey-columns text-muted-foreground">
          {journeyContent.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <div className="mt-6 border-t border-surface pt-4 text-muted-foreground">
          <p>Mathematics, 2022–2025 <span aria-hidden="true">→</span><span className="sr-only">then</span> Computer Science, 2025–present</p>
          <p>University of the Philippines Cebu</p>
        </div>
        <p className="mt-6 max-w-2xl text-muted-foreground">{journeyContent.transition}</p>
      </section>
      <ProjectDeck projects={getHomepageProjects().map(({ slug, title, description, listing }) => ({ slug, title, description, listing: { thumbnail: listing.thumbnail } }))} />
      <ExperienceSection content={aboutContent} />
      <section id="focus" className="portfolio-container portfolio-section" aria-labelledby="focus-heading">
        <div className="section-heading"><h2 id="focus-heading" className="h2">{currentFocusContent.title}</h2></div>
        <p className="max-w-3xl text-muted-foreground">{currentFocusContent.intro}</p>
      </section>
      <ContactSection content={contactContent} />
    </main>
    <FooterSection links={siteConfig.navigation.footer} copyrightName={siteConfig.footer.copyrightName} />
  </>;
}
