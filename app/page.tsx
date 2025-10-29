import NavigationBar from './components/NavigationBar';
import HeroSection from './sections/HeroSection';
import ProjectsSection from './sections/ProjectsSection';
import AboutSection from './sections/AboutSection';
import { projectsData } from './data/projects';
import { LAYOUT_STYLES } from './styles/shared';

const heroData = {
  name: 'John Lester Escarlan',
  role: 'Software Engineer',
  tagline: 'Building thoughtful digital experiences.',
  profileImage: {
    src: '/hero-image.svg',
    alt: 'Profile picture'
  },
  socialLinks: [
    { platform: 'GitHub', url: 'https://github.com/jlescarlan11', label: 'GitHub', icon: 'github' },
    { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/john-lester-escarlan/', label: 'LinkedIn', icon: 'linkedin' },
    { platform: 'HackerRank', url: 'https://www.hackerrank.com/profile/jlescarlan11', label: 'HackerRank', icon: 'code' },
    { platform: 'Email', url: 'mailto:jlescarlan11@gmail.com', label: 'Email', icon: 'email' }
  ]
};


export default function Home() {
  return (
    <>
      <NavigationBar />
      
      <HeroSection {...heroData} />

      {/* Projects Section */}
      <ProjectsSection projects={projectsData} />

      {/* About Section */}
      <AboutSection
        education={[
          { title: 'Bachelor of Science in Computer Science', subtitle: 'University of the Philippines', badges: ['College Scholar'], period: 'Aug 2025–Present', watermark: 'CS' },
          { title: 'Bachelor of Science in Mathematics', subtitle: 'University of the Philippines', badges: ['College Scholar', 'DOST Scholar'], period: 'Sep 2022–Jun 2025', watermark: 'MA' }
        ]}
        experience={[
          { title: 'Software Monitoring Engineer', subtitle: "Wind's Gate Philippines", badges: ['Observability', 'Enterprise Applications'], period: 'Jun 2025–Present', watermark: 'WG' },
          { title: 'Software Engineer Intern', subtitle: 'Alliance Software Inc.', badges: ['C#', 'ASP.NET'], period: 'Jun–Jul 2025' },
          { title: 'Full‑Stack Developer Intern', subtitle: 'Bayoa Analytics', badges: ['REST APIs', 'Database Optimization'], period: 'Sep–Nov 2024' }
        ]}
        certifications={[
          {
            name: 'Agile Project Management',
            issuer: 'Google',
            year: '2025',
            url: 'https://www.coursera.org/account/accomplishments/verify/QYUV5C56WQCV'
          }
        ]}
        tech={[
          { label: 'TypeScript' },
          { label: 'JavaScript' },
          { label: 'Python' },
          { label: 'Java' },
          { label: 'C#' },
          { label: 'React' },
          { label: 'Next.js' },
          { label: 'Node.js' },
          { label: 'Spring Boot' },
          { label: 'PostgreSQL' },
          { label: 'MongoDB' },
          { label: 'Docker' },
          { label: 'Kubernetes' },
          { label: 'AWS' },
          { label: 'Git' },
          { label: 'Jest' }
        ]}
      />

{/* Contact Section */}
<section id="contact" className="
  flex items-center
  px-6 md:px-12 py-16 md:py-24 pb-32
  bg-black
  border-t border-white/10
">
        <div className={`${LAYOUT_STYLES.container} w-full mx-auto`}>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight leading-[0.95] mb-6 text-white">
            Get in touch
          </h2>
          <p className="text-sm md:text-base text-white/70 max-w-2xl mb-6">
            I’m available for select collaborations and roles. Email me and I’ll reply within 48 hours.
          </p>
          <a href="mailto:jlescarlan11@gmail.com" className="inline-block text-[11px] uppercase tracking-[0.3em] underline underline-offset-4 decoration-white/40 hover:decoration-white transition">
            jlescarlan11@gmail.com
          </a>
        </div>
      </section>
    </>
  );
}
