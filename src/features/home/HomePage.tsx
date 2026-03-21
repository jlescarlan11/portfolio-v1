import { Suspense } from 'react';
import AboutSection from '@/features/about/AboutSection';
import { aboutContent } from '@/features/about/content';
import ContributionGraph from '@/features/about/components/ContributionGraph';
import ContactSection from '@/features/contact/ContactSection';
import { contactContent } from '@/features/contact/content';
import { FooterSection, HeroSection, heroContent } from '@/features/home';
import { ProjectsSection, projects, projectsSectionContent } from '@/features/projects';
import NavigationBar from '@/shared/components/NavigationBar';
import AvailabilityBadge from '@/shared/components/AvailabilityBadge';
import { siteConfig } from '@/shared/site/config';

export default function HomePage(): React.JSX.Element {
  return (
    <>
      <header>
        <NavigationBar items={siteConfig.navigation.header} />
      </header>

      <main id="main-content">
        <HeroSection {...heroContent} />
        <ProjectsSection
          projects={projects}
          content={projectsSectionContent}
        />
        <AboutSection
          content={aboutContent}
          contributionSlot={
            <Suspense fallback={null}>
              <ContributionGraph username="jlescarlan11" />
            </Suspense>
          }
        />
        <ContactSection content={contactContent} />
      </main>

      <FooterSection
        links={siteConfig.navigation.footer}
        copyrightName={siteConfig.footer.copyrightName}
      />

      <AvailabilityBadge />
    </>
  );
}