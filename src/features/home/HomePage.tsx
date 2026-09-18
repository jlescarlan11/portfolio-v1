import { Suspense } from 'react';
import ExperienceSection from '@/features/about/ExperienceSection';
import { aboutContent } from '@/features/about/content';
import ContributionGraph from '@/features/about/components/ContributionGraph';
import FooterSection from './components/FooterSection';
import HeroSection from './components/HeroSection';
import { heroContent } from './content';
import { projects } from '@/features/projects/data';
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
      <ExperienceSection content={aboutContent} />
      <ProjectDeck projects={['rent-n-roll', 'pacu', 'pricecraft'].map(slug => {
        const project = projects.find(item => item.slug === slug)!;
        return { slug: project.slug, title: project.title, description: project.description,
          listing: { thumbnail: project.listing.thumbnail } };
      })} />
      <section className="portfolio-container portfolio-section" aria-labelledby="github-heading">
        <div className="section-heading"><h2 className="h2" id="github-heading">GitHub Activity</h2><a className="portfolio-link" href="https://github.com/jlescarlan11" target="_blank" rel="noopener noreferrer">@jlescarlan11 ↗</a></div>
        <Suspense fallback={<p className="text-muted-foreground">Loading GitHub activity…</p>}><ContributionGraph username="jlescarlan11" /></Suspense>
      </section>
      <ContactSection content={contactContent} />
    </main>
    <FooterSection links={siteConfig.navigation.footer} copyrightName={siteConfig.footer.copyrightName} />
  </>;
}
