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
    { platform: 'GitHub', url: 'https://github.com', label: 'GitHub', icon: 'github' },
    { platform: 'LinkedIn', url: 'https://linkedin.com', label: 'LinkedIn', icon: 'linkedin' },
    { platform: 'Twitter', url: 'https://twitter.com', label: 'Twitter', icon: 'twitter' },
    { platform: 'Email', url: 'mailto:hello@example.com', label: 'Email', icon: 'email' }
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
          { title: 'Bachelor of Science in Computer Science', subtitle: 'University of the Philippines', badges: ['College Scholar', 'DOST Scholar'], period: '2018–2022', watermark: 'CS' },
          { title: 'Machine Learning Specialization', subtitle: 'Coursera / DeepLearning.AI', badges: ['with Honors'], period: '2023' },
          { title: 'Frontend Engineering Nanodegree', subtitle: 'Udacity', badges: ['React', 'Performance'], period: '2023' }
        ]}
        experience={[
          { title: 'Software Monitoring Engineer', subtitle: "Wind's Gate Philippines", badges: ['Observability', 'Automation'], period: '2024–Present', watermark: 'WG' },
          { title: 'Full‑Stack Developer (Contract)', subtitle: 'Tech Startup Inc.', badges: ['Next.js', 'Postgres'], period: '2023–2024' },
          { title: 'Open Source Contributor', subtitle: 'Various projects', badges: ['OSS', 'DX'], period: '2022–Present' }
        ]}
        certifications={[
          {
            name: 'AWS Certified Cloud Practitioner',
            issuer: 'Amazon Web Services',
            year: '2025',
            badge: 'https://img.icons8.com/color/96/amazon-web-services.png',
            url: 'https://www.credly.com/badges'
          },
          {
            name: 'Oracle Certified Professional, Java SE',
            issuer: 'Oracle',
            year: '2025',
            badge: 'https://img.icons8.com/color/96/java-coffee-cup-logo.png',
            url: 'https://www.credly.com/badges'
          },
          {
            name: 'Google Professional Cloud Developer (in progress)',
            issuer: 'Google Cloud',
            year: '2026'
          }
        ]}
        tech={[
          { label: 'TypeScript', iconHref: 'https://icon.icepanel.io/Technology/svg/TypeScript.svg' },
          { label: 'React', iconHref: 'https://icon.icepanel.io/Technology/svg/React.svg' },
          { label: 'Next.js', iconHref: 'https://icon.icepanel.io/Technology/svg/Next.js.svg' },
          { label: 'Java', iconHref: 'https://icon.icepanel.io/Technology/svg/Java.svg' },
          { label: 'Spring Boot', iconHref: 'https://icon.icepanel.io/Technology/svg/Spring.svg' },
          { label: 'PostgreSQL', iconHref: 'https://icon.icepanel.io/Technology/svg/PostgresSQL.svg' },
          { label: 'AWS', iconHref: 'https://icon.icepanel.io/Technology/svg/AWS.svg' },
          { label: 'Docker', iconHref: 'https://icon.icepanel.io/Technology/svg/Docker.svg' }
        ]}
      />

      {/* Contact Section */}
      <section id="contact" className="
        flex items-center
        px-6 md:px-12 py-16 md:py-24
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
          <a href="mailto:hello@example.com" className="inline-block text-[11px] uppercase tracking-[0.3em] underline underline-offset-4 decoration-white/40 hover:decoration-white transition">
            hello@example.com
          </a>
        </div>
      </section>
    </>
  );
}
