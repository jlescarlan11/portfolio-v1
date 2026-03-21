import type { JSX } from 'react';
import { FaJava } from 'react-icons/fa6';
import {
  SiAmazonwebservices,
  SiDocker,
  SiDotnet,
  SiDrizzle,
  SiElectron,
  SiExpress,
  SiGithubactions,
  SiGit,
  SiJavascript,
  SiJest,
  SiKubernetes,
  SiLangchain,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiOpenai,
  SiOpenid,
  SiPostgresql,
  SiPrisma,
  SiPython,
  SiReact,
  SiRedis,
  SiReplit,
  SiRss,
  SiSharp,
  SiShopify,
  SiSocketdotio,
  SiSpring,
  SiSqlite,
  SiStripe,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiVite,
  SiWebauthn
} from 'react-icons/si';
import type { AboutContent } from '@/features/about/content';
import SectionFrame from '@/shared/components/SectionFrame';
import { Typography } from '@/shared/components/Typography';
import { FadeIn } from '@/shared/components/FadeIn';
import { formatMonthYear } from '@/shared/lib/project';
import { SURFACE } from '@/shared/styles/shared';
import { CertificationsList } from '@/features/about/components/CertificationsList';

interface AboutSectionProps {
  content: AboutContent;
  contributionSlot?: React.ReactNode;
}

const getTechIcon = (label: string): JSX.Element | null => {
  const techIcons: Record<string, JSX.Element> = {
    TypeScript: <SiTypescript />,
    JavaScript: <SiJavascript />,
    Python: <SiPython />,
    Java: <FaJava />,
    'C#': <SiSharp />,
    React: <SiReact />,
    'React Native': <SiReact />,
    'Next.js': <SiNextdotjs />,
    'Node.js': <SiNodedotjs />,
    'Express.js': <SiExpress />,
    'Spring Boot': <SiSpring />,
    'ASP.NET': <SiDotnet />,
    Vite: <SiVite />,
    'Tailwind CSS': <SiTailwindcss />,
    PostgreSQL: <SiPostgresql />,
    PostGIS: <SiPostgresql />,
    SQLite: <SiSqlite />,
    MongoDB: <SiMongodb />,
    Redis: <SiRedis />,
    'Drizzle ORM': <SiDrizzle />,
    Prisma: <SiPrisma />,
    'Prisma ORM': <SiPrisma />,
    Docker: <SiDocker />,
    Kubernetes: <SiKubernetes />,
    AWS: <SiAmazonwebservices />,
    Vercel: <SiVercel />,
    Supabase: <SiSupabase />,
    'Replit Object Storage': <SiReplit />,
    'GitHub CI/CD': <SiGithubactions />,
    'GitHub Actions': <SiGithubactions />,
    'Stripe API': <SiStripe />,
    'Shopify Integration': <SiShopify />,
    OAuth2: <SiOpenid />,
    'OpenID Connect': <SiOpenid />,
    'JWT/OAuth2 Authentication': <SiOpenid />,
    'JWT/OAuth2': <SiOpenid />,
    WebAuthn: <SiWebauthn />,
    'Socket.io': <SiSocketdotio />,
    'WebSocket (Socket.io)': <SiSocketdotio />,
    'OpenAI API': <SiOpenai />,
    LangChain: <SiLangchain />,
    Electron: <SiElectron />,
    Git: <SiGit />,
    Vitest: <SiJest />,
    Playwright: <SiJest />,
    'TanStack Query': <SiReact />,
    'RSS Parsing': <SiRss />
  };
  return techIcons[label] ?? null;
};

function SectionLabel({ children }: { children: string }) {
  return (
    <Typography
      variant="caption"
      as="p"
      className="mb-6 text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground"
    >
      {children}
    </Typography>
  );
}

interface SkillChipProps {
  label: string;
  icon: JSX.Element;
}

function SkillChip({ label, icon }: SkillChipProps) {
  return (
    <li>
      <span
        className={`inline-flex items-center gap-2 border ${SURFACE.hairline} px-2.5 py-1.5 transition-colors duration-200 hover:border-foreground/20 hover:text-foreground`}
      >
        <span
          className="flex-shrink-0 text-muted-foreground [&>svg]:h-3.5 [&>svg]:w-3.5"
          aria-hidden="true"
        >
          {icon}
        </span>
        <Typography
          variant="caption"
          as="span"
          className="text-[11px] text-muted-foreground leading-none"
        >
          {label}
        </Typography>
      </span>
    </li>
  );
}

interface TimelineRowProps {
  title: string;
  subtitle: string;
  startDate: string;
  endDate?: string | null;
  isCurrent?: boolean;
  bullets: string[];
}

function TimelineRow({ title, subtitle, startDate, endDate, isCurrent, bullets }: TimelineRowProps) {
  const start = formatMonthYear(startDate);

  return (
    <li className="group relative py-7 first:pt-0 last:pb-0">
      <span
        className="absolute left-0 top-7 bottom-7 w-px bg-foreground/0 transition-all duration-300 group-hover:bg-foreground/10"
        aria-hidden="true"
      />
      <div className="pl-0 transition-all duration-300 group-hover:pl-4">
        <div className="mb-1 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <Typography
            variant="h4"
            as="h4"
            className="font-semibold leading-snug transition-colors duration-200 group-hover:text-foreground"
          >
            {title}
          </Typography>
          <Typography
            variant="caption"
            as="p"
            className="flex-shrink-0 font-mono text-[11px] tabular-nums text-subtle-foreground/70"
          >
            <time dateTime={startDate}>{start}</time>
            <span className="mx-1 opacity-40">—</span>
            {isCurrent || !endDate ? (
              <span className="text-foreground/40">Present</span>
            ) : (
              <time dateTime={endDate}>{formatMonthYear(endDate)}</time>
            )}
          </Typography>
        </div>
        <Typography variant="caption" as="p" className="mb-4 text-[12px] text-subtle-foreground">
          {subtitle}
        </Typography>
        {bullets.length > 0 && (
          <ul className="flex flex-col gap-2.5">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-[9px] h-1 w-1 flex-shrink-0 bg-foreground/20 transition-colors duration-300 group-hover:bg-foreground/40"
                />
                <Typography
                  variant="body-sm"
                  as="span"
                  className="leading-relaxed text-muted-foreground transition-colors duration-200 group-hover:text-foreground/80"
                >
                  {bullet}
                </Typography>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

export default function AboutSection({ content, contributionSlot }: AboutSectionProps): React.JSX.Element {
  const { certifications, education, experience, techCategories } = content;

  const iconCategories = techCategories
    .map(({ category, items }) => ({
      category,
      items: items.filter((item) => getTechIcon(item.label) !== null)
    }))
    .filter(({ items }) => items.length > 0);

  return (
    <SectionFrame
      id="about"
      headingId="about-heading"
      eyebrow={content.eyebrow}
      title={content.title}
      intro={content.intro}
    >
      <div className="space-y-14">

        {/* ── SKILLS + CONTRIBUTION GRAPH ────────────────────────── */}
        {iconCategories.length > 0 && (
          <FadeIn
            delay={100}
            as="section"
            className={`border-t ${SURFACE.hairline} pt-10`}
            aria-labelledby="skills-heading"
          >
            <SectionLabel>Skills</SectionLabel>

            {/* Chip groups — three categories stacked */}
            <div className="mb-10 space-y-7">
              {iconCategories.map(({ category, items }) => (
                <div key={category}>
                  <Typography
                    variant="caption"
                    as="p"
                    className="mb-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/25"
                  >
                    {category}
                  </Typography>
                  <ul className="flex flex-wrap gap-2">
                    {items.map((item) => {
                      const icon = getTechIcon(item.label);
                      if (!icon) return null;
                      return <SkillChip key={item.label} label={item.label} icon={icon} />;
                    })}
                  </ul>
                </div>
              ))}
            </div>

            {/* Contribution graph — full width below all chip groups */}
            {contributionSlot && (
              <div className={`border-t ${SURFACE.hairline} pt-8`}>
                {contributionSlot}
              </div>
            )}
          </FadeIn>
        )}

        {/* ── CREDENTIALS ── */}
        {certifications.length > 0 && (
          <FadeIn
            delay={200}
            as="section"
            className={`border-t ${SURFACE.hairline} pt-10`}
            aria-labelledby="credentials-heading"
          >
            <SectionLabel>Credentials</SectionLabel>
            <CertificationsList 
              certifications={certifications} 
              initialVisibleCount={content.certificationsVisibleCount} 
            />
          </FadeIn>
        )}

        {/* ── EXPERIENCE ── */}
        <FadeIn
          delay={300}
          as="section"
          className={`border-t ${SURFACE.hairline} pt-10`}
          aria-labelledby="experience-heading"
        >
          <SectionLabel>Experience</SectionLabel>
          <ul className="divide-y divide-foreground/5">
            {experience.map((item) => (
              <TimelineRow
                key={item.id}
                title={item.title}
                subtitle={item.company}
                startDate={item.startDate}
                endDate={item.endDate}
                isCurrent={item.isCurrent}
                bullets={item.responsibilities}
              />
            ))}
          </ul>
        </FadeIn>

        {/* ── EDUCATION ── */}
        <FadeIn
          delay={400}
          as="section"
          className={`border-t ${SURFACE.hairline} pt-10`}
          aria-labelledby="education-heading"
        >
          <SectionLabel>Education</SectionLabel>
          <ul className="divide-y divide-foreground/5">
            {education.map((item) => (
              <TimelineRow
                key={item.id}
                title={item.degree}
                subtitle={item.school}
                startDate={item.startDate}
                endDate={item.endDate}
                isCurrent={item.isCurrent}
                bullets={item.achievements ?? []}
              />
            ))}
          </ul>
        </FadeIn>

      </div>
    </SectionFrame>
  );
}
