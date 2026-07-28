import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getProjectBySlug,
  getProjectSlugs
} from '@/features/projects';
import {
  ProjectEvidenceSections,
  ProjectMetaStrip,
  ProjectSectionLabel
} from '@/features/projects/components/ProjectCaseStudySections';
import { Typography } from '@/shared/components/Typography';
import { FadeIn } from '@/shared/components/FadeIn';
import { siteConfig } from '@/shared/site/config';
import { SURFACE, TYPOGRAPHY_STYLES } from '@/shared/styles/shared';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  const galleryImage = project.caseStudy.gallery?.[0];
  const socialImage = galleryImage
    ? { url: galleryImage, alt: project.title }
    : {
        url: siteConfig.seo.socialImage.path,
        alt: siteConfig.seo.socialImage.alt
      };

  return {
    title: project.title,
    description: project.caseStudy.summary,
    openGraph: {
      title: project.title,
      description: project.caseStudy.summary,
      url: `${siteConfig.seo.siteUrl}/projects/${project.slug}`,
      siteName: siteConfig.seo.siteName,
      images: [socialImage]
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.caseStudy.summary,
      images: [socialImage]
    }
  };
}

// ─── Hero: two graceful states ─────────────────────────────────────────────────
// Real screenshot → full-bleed 16/9 image
// Logo only       → centered logo on a grid-textured surface (never a broken img)
interface ProjectHeroProps {
  src: string;
  title: string;
  isLogo?: boolean;
}

function ProjectHero({ src, title, isLogo }: ProjectHeroProps) {
  if (isLogo) {
    if (!src) {
      return (
        <div
          className={`relative flex w-full items-center justify-center overflow-hidden border ${SURFACE.hairline} bg-surface-tint`}
          style={{ aspectRatio: '16/9' }}
        >
          <div className="surface-grid-mask absolute inset-0 opacity-50" aria-hidden="true" />
          <span
            aria-hidden="true"
            className="relative z-10 select-none font-black leading-none tracking-tighter text-foreground/[0.06]"
            style={{ fontSize: 'clamp(3.5rem, 14vw, 9rem)' }}
          >
            {title}
          </span>
        </div>
      );
    }
    return (
      <div
        className={`relative flex w-full items-center justify-center overflow-hidden border ${SURFACE.hairline} bg-surface-tint`}
        style={{ aspectRatio: '16/9' }}
      >
        <div className="surface-grid-mask absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative z-10 flex items-center justify-center px-12 py-16">
          <Image
            src={src}
            alt={`${title} logo`}
            width={280}
            height={140}
            className="max-h-28 w-auto object-contain opacity-80"
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden border ${SURFACE.hairline} bg-surface-muted`}
      style={{ aspectRatio: '16/9' }}
    >
      <Image
        src={src}
        alt={`${title} preview`}
        fill
        sizes="(max-width: 768px) calc(100vw - 2.5rem), 768px"
        className="object-cover transition-transform duration-700 hover:scale-[1.02]"
        priority
      />
    </div>
  );
}

// ─── Smart gallery ─────────────────────────────────────────────────────────────
// 1 image  → full-width 16/9
// 2 images → side by side 4/3
// 3+       → first image full-width hero, rest in 2-col grid
interface SmartGalleryProps {
  images: string[];
  projectTitle: string;
}

function SmartGallery({ images, projectTitle }: SmartGalleryProps) {
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div
        className={`relative w-full overflow-hidden border ${SURFACE.hairline} bg-surface-muted`}
        style={{ aspectRatio: '16/9' }}
      >
        <Image
          src={images[0]}
          alt={`${projectTitle} screenshot`}
          fill
          sizes="(max-width: 768px) calc(100vw - 2.5rem), 768px"
          className="object-cover"
        />
      </div>
    );
  }

  if (images.length === 2) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {images.map((img, i) => (
          <div
            key={img}
            className={`relative overflow-hidden border ${SURFACE.hairline} bg-surface-muted`}
            style={{ aspectRatio: '4/3' }}
          >
            <Image
              src={img}
              alt={`${projectTitle} — view ${i + 1}`}
              fill
              sizes="(max-width: 640px) calc(100vw - 2.5rem), 378px"
              className="object-cover transition-transform duration-500 hover:scale-[1.03]"
            />
          </div>
        ))}
      </div>
    );
  }

  // 3+ images
  const [hero, ...rest] = images;
  return (
    <div className="space-y-3">
      <div
        className={`relative w-full overflow-hidden border ${SURFACE.hairline} bg-surface-muted`}
        style={{ aspectRatio: '16/9' }}
      >
        <Image
          src={hero}
          alt={`${projectTitle} — main view`}
          fill
          sizes="(max-width: 768px) calc(100vw - 2.5rem), 768px"
          className="object-cover transition-transform duration-500 hover:scale-[1.02]"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {rest.map((img, i) => (
          <div
            key={img}
            className={`relative overflow-hidden border ${SURFACE.hairline} bg-surface-muted`}
            style={{ aspectRatio: '4/3' }}
          >
            <Image
              src={img}
              alt={`${projectTitle} — view ${i + 2}`}
              fill
              sizes="(max-width: 768px) 50vw, 378px"
              className="object-cover transition-transform duration-500 hover:scale-[1.03]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default async function ProjectPage({ params }: ProjectPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const galleryImages = project.caseStudy.gallery ?? [];
  const hasRealScreenshot = galleryImages.length > 0;
  const heroSrc = hasRealScreenshot ? galleryImages[0] : project.logo;
  // If a real screenshot is used as hero, remaining gallery starts at index 1
  const remainingGallery = hasRealScreenshot ? galleryImages.slice(1) : [];
  const showGallery = remainingGallery.length > 0;

  return (
    <>
      <main
        id="main-content"
        tabIndex={-1}
        className="bg-surface px-5 pb-24 pt-12 sm:px-8 md:px-12 md:pb-32 md:pt-20"
      >
        <article className="mx-auto max-w-3xl">

          {/* ── HEADER ─────────────────────────────────────────────── */}
          <FadeIn as="header" className="mb-10 md:mb-12">
            {/* Top Navigation Row */}
            <div className="mb-12 flex items-center justify-between border-b border-surface pb-6">
              <Link
                href="/#work"
                prefetch={false}
                className="group flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.15em] text-foreground transition-colors hover:text-muted-foreground"
              >
                <span aria-hidden="true" className="transition-transform group-hover:-translate-x-1">←</span>
                Back to selected work
              </Link>
              <Typography
                variant="caption"
                as="span"
                className="font-mono text-[11px] text-foreground/20"
                aria-hidden="true"
              >
                /{project.slug}
              </Typography>
            </div>

            {/* Eyebrow */}
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-5 bg-foreground/25" aria-hidden="true" />
              <Typography
                variant="caption"
                as="p"
                className="text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground"
              >
                {project.category}
              </Typography>
            </div>

            {/* Title */}
            <Typography
              variant="display"
              as="h1"
              className="mb-4 font-black leading-[1.02] tracking-tight"
              style={{ fontSize: 'clamp(2.2rem, 7vw, 3.75rem)' }}
            >
              {project.title}
            </Typography>

            {/* Summary */}
            <Typography
              variant="body-lg"
              as="p"
              className="max-w-lg leading-relaxed text-muted-foreground"
            >
              {project.caseStudy.summary}
            </Typography>
          </FadeIn>

          {/* ── HERO ───────────────────────────────────────────────── */}
          <FadeIn delay={80} className="mb-8 md:mb-10">
            <ProjectHero
              src={heroSrc}
              title={project.title}
              isLogo={!hasRealScreenshot}
            />
          </FadeIn>

          {/* ── META STRIP ─────────────────────────────────────────── */}
          <FadeIn delay={150} className="mb-14 md:mb-18">
            <ProjectMetaStrip
              roleScope={project.caseStudy.roleScope}
              client={project.client}
              completedAt={project.completedAt}
              technologies={project.technologies}
              liveUrl={project.links.liveUrl}
              githubUrl={project.links.githubUrl}
            />
          </FadeIn>

          {/* ── OVERVIEW ───────────────────────────────────────────── */}
          <FadeIn
            delay={220}
            as="section"
            className="mb-14 md:mb-18"
            aria-labelledby="overview-heading"
          >
            <ProjectSectionLabel id="overview-heading">
              Overview
            </ProjectSectionLabel>
            <div className="space-y-5">
              {project.caseStudy.overview.map((paragraph) => (
                <Typography
                  key={paragraph}
                  variant="body"
                  as="p"
                  className="leading-relaxed text-muted-foreground"
                >
                  {paragraph}
                </Typography>
              ))}
            </div>
          </FadeIn>

          <ProjectEvidenceSections
            impact={project.caseStudy.impact}
            decisions={project.caseStudy.decisions}
          />

          {/* ── HIGHLIGHTS ─────────────────────────────────────────── */}
          <FadeIn
            delay={460}
            as="section"
            className={`mb-14 border-t ${SURFACE.hairline} pt-10 md:mb-18`}
            aria-labelledby="highlights-heading"
          >
            <ProjectSectionLabel id="highlights-heading">
              Highlights
            </ProjectSectionLabel>
            <ul className="space-y-5">
              {project.caseStudy.highlights.map((highlight, i) => (
                <li key={highlight} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center border border-foreground/10 font-mono text-[10px] font-medium tabular-nums text-foreground/30"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <Typography
                    variant="body"
                    as="span"
                    className="leading-relaxed text-muted-foreground"
                  >
                    {highlight}
                  </Typography>
                </li>
              ))}
            </ul>
          </FadeIn>

          {/* ── GALLERY — only if there are remaining images after the hero ── */}
          {showGallery && (
            <FadeIn
              delay={540}
              as="section"
              className={`mb-14 border-t ${SURFACE.hairline} pt-10 md:mb-18`}
              aria-labelledby="gallery-heading"
            >
              <ProjectSectionLabel id="gallery-heading">
                Gallery
              </ProjectSectionLabel>
              <SmartGallery
                images={remainingGallery}
                projectTitle={project.title}
              />
            </FadeIn>
          )}

          {/* ── FOOTER ─────────────────────────────────────────────── */}
          <FadeIn
            delay={620}
            className={`border-t ${SURFACE.hairline} pt-10`}
          >
            <div className="flex items-center justify-between">
              <Link
                href="/#work"
                prefetch={false}
                className={`${TYPOGRAPHY_STYLES.linkPrimary} inline-flex items-center gap-2`}
              >
                <span aria-hidden="true">←</span>
                Back to selected work
              </Link>
              <Typography
                variant="caption"
                as="span"
                className="font-mono text-[11px] text-foreground/20"
                aria-hidden="true"
              >
                /{project.slug}
              </Typography>
            </div>
          </FadeIn>

        </article>
      </main>
    </>
  );
}
