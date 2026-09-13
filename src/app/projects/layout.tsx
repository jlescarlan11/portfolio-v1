import NavigationBar from '@/shared/components/NavigationBar';
import FooterSection from '@/features/home/components/FooterSection';
import { siteConfig } from '@/shared/site/config';
export default function ProjectsLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <><header><NavigationBar items={siteConfig.navigation.header} /></header>{children}<FooterSection links={siteConfig.navigation.footer} copyrightName={siteConfig.footer.copyrightName} /></>;
}
