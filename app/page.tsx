import NavigationBar from './components/NavigationBar';
import HeroSection from './sections/HeroSection';
import ProjectsSection from './sections/ProjectsSection';
import AboutSection from './sections/AboutSection';
import { projectsData } from './data/projects';
import { LAYOUT_STYLES } from './styles/shared';

const heroData = {
  name: 'John Lester Escarlan',
  role: 'Full-Stack Software Engineer',
  tagline: 'Building scalable web and mobile applications. Specialized in backend systems, observability, and cloud architecture.',
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
          { id: 'edu-up-cs', title: 'Bachelor of Science in Computer Science', subtitle: 'University of the Philippines', badges: ['College Scholar'], period: 'Aug 2025–Present', watermark: 'CS' },
          { id: 'edu-up-math', title: 'Bachelor of Science in Mathematics', subtitle: 'University of the Philippines', badges: ['College Scholar', 'DOST Scholar'], period: 'Sep 2022–Jun 2025', watermark: 'MA' }
        ]}
        experience={[
          { id: 'exp-pc-software-engineer', title: 'Software Engineer', subtitle: 'Pharmacy & Acute Care University', badges: ['Backend Development', 'System Reliability'], period: 'Feb 2026–Present', watermark: 'PC' },
          { id: 'exp-codevf-software-engineer', title: 'Software Engineer', subtitle: 'CodeVF', badges: ['Engineering Support', 'Automation'], period: 'Jan 2026–Present', watermark: 'CF' },
          { id: 'exp-wg-monitoring-engineer', title: 'Software Monitoring Engineer', subtitle: "Wind's Gate Philippines", badges: ['Observability', 'Enterprise Applications'], period: 'Jun 2025–Present', watermark: 'WG' },
          { id: 'exp-asi-software-engineer-intern', title: 'Software Engineer Intern', subtitle: 'Alliance Software Inc.', badges: ['C#', 'ASP.NET'], period: 'Jun–Jul 2025' },
          { id: 'exp-bayoa-full-stack-intern', title: 'Full‑Stack Developer Intern', subtitle: 'Bayoa Analytics', badges: ['REST APIs', 'Database Optimization'], period: 'Sep–Nov 2024' }
        ]}
        certifications={[
          {
            name: 'Amazon Junior Software Developer with Generative AI',
            issuer: 'Amazon',
            year: '2025',
          },
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
          { label: 'C' },
          { label: 'SQL' },
          { label: 'C#' },
          { label: 'React' },
          { label: 'React Native' },
          { label: 'Next.js' },
          { label: 'Vite' },
          { label: 'TanStack Query' },
          { label: 'Tailwind CSS' },
          { label: 'shadcn/ui' },
          { label: 'Express.js' },
          { label: 'Node.js' },
          { label: 'Spring Boot' },
          { label: 'ASP.NET' },
          { label: 'RESTful API Design' },
          { label: 'Middleware Architecture' },
          { label: 'Request Validation (Zod)' },
          { label: 'JWT/OAuth2 Authentication' },
          { label: 'Clean Architecture' },
          { label: 'Design Patterns' },
          { label: 'Schema Migration' },
          { label: 'N+1 Query Prevention' },
          { label: 'Passport.js' },
          { label: 'OpenID Connect' },
          { label: 'JWT' },
          { label: 'RBAC' },
          { label: 'Helmet' },
          { label: 'CSP' },
          { label: 'OpenAI API' },
          { label: 'Google Gemini' },
          { label: 'PostgreSQL' },
          { label: 'PostGIS' },
          { label: 'MongoDB' },
          { label: 'SQLite' },
          { label: 'Redis' },
          { label: 'Drizzle ORM' },
          { label: 'Prisma ORM' },
          { label: 'Playwright' },
          { label: 'Supertest' },
          { label: 'Integration & Contract Testing' },
          { label: 'WebSocket (Socket.io)' },
          { label: 'Event Streaming' },
          { label: 'Docker' },
          { label: 'Vercel' },
          { label: 'GitHub CI/CD' },
          { label: 'Supabase' },
          { label: 'Replit Object Storage' },
          { label: 'Webhooks' },
          { label: 'Subscription Systems' },
          { label: 'Shopify Integration' },
          { label: 'Vector Embeddings' },
          { label: 'RAG' },
          { label: 'Prompt Engineering' },
          { label: 'PDF Generation (jsPDF)' },
          { label: 'Audio Processing' },
          { label: 'RSS Parsing' },
          { label: 'Prisma' },
          { label: 'Kubernetes' },
          { label: 'AWS' },
          { label: 'Stripe API' },
          { label: 'OAuth2' },
          { label: 'WebAuthn' },
          { label: 'Socket.io' },
          { label: 'LangChain' },
          { label: 'Electron' },
          { label: 'Git' },
          { label: 'Vitest' }
        ]}
        techCategories={[
          {
            category: 'Languages',
            items: [
              { label: 'TypeScript' }, { label: 'JavaScript' }, { label: 'Python' },
              { label: 'Java' }, { label: 'C' }, { label: 'SQL' }, { label: 'C#' },
            ]
          },
          {
            category: 'Frontend',
            items: [
              { label: 'TypeScript' }, { label: 'JavaScript' }, { label: 'React' },
              { label: 'React Native' }, { label: 'Next.js' }, { label: 'Electron' },
              { label: 'Vite' }, { label: 'TanStack Query' }, { label: 'Tailwind CSS' },
              { label: 'shadcn/ui' },
            ]
          },
          {
            category: 'Backend',
            items: [
              { label: 'Python' }, { label: 'Java' }, { label: 'C#' },
              { label: 'Node.js' }, { label: 'Express.js' }, { label: 'Spring Boot' },
              { label: 'ASP.NET' }, { label: 'JWT/OAuth2 Authentication' },
            ]
          },
          {
            category: 'Databases',
            items: [
              { label: 'PostgreSQL' }, { label: 'PostGIS' }, { label: 'MongoDB' },
              { label: 'SQLite' }, { label: 'Redis' }, { label: 'Drizzle ORM' },
              { label: 'Prisma ORM' },
            ]
          },
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
          <div className="flex flex-wrap items-center gap-6 mt-6">
            <a href="mailto:jlescarlan11@gmail.com" className="inline-block text-[11px] uppercase tracking-[0.3em] underline underline-offset-4 decoration-white/40 hover:decoration-white transition">
              jlescarlan11@gmail.com
            </a>
            <a
              href="/project/John_Lester_Escarlan_Resume.pdf"
              download
              target="_blank"
              rel="noreferrer"
              className="inline-block text-[11px] uppercase tracking-[0.3em] underline underline-offset-4 decoration-white/40 hover:decoration-white transition"
            >
              Download Résumé
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
