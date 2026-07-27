import { Suspense } from 'react';
import AboutSection from '@/features/about/AboutSection';
import { aboutContent } from '@/features/about/content';
import ContributionGraph from '@/features/about/components/ContributionGraph';
import ContactSection from '@/features/contact/ContactSection';
import { contactContent } from '@/features/contact/content';
import FooterSection from '@/features/home/components/FooterSection';
import HeroSection from '@/features/home/components/HeroSection';
import InitialLoadExperience from '@/features/home/components/InitialLoadExperience';
import { heroContent } from '@/features/home/content';
import { ProjectsSection, projects, projectsSectionContent } from '@/features/projects';
import NavigationBar from '@/shared/components/NavigationBar';
import { siteConfig } from '@/shared/site/config';

export default function HomePage(): React.JSX.Element {
  return (
    <InitialLoadExperience>
      <header>
        <NavigationBar items={siteConfig.navigation.header} />
      </header>

      <main id="main-content" tabIndex={-1}>
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
    </InitialLoadExperience>
  );
}
