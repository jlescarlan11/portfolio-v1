'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ProjectWithDetails } from '../types/project';
import { LAYOUT_STYLES, TYPOGRAPHY_STYLES, BUTTON_STYLES, MOTION_VARIANTS } from '../styles/shared';

interface ProjectsSectionProps {
  projects: ProjectWithDetails[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [visible, setVisible] = useState(6);
  const visibleProjects = projects.slice(0, visible);

  return (
    <section 
      id="work"
      className="px-6 md:px-12 py-16 md:py-24 bg-black border-t border-white/12"
      style={{ scrollPaddingTop: '120px' }}
      aria-label="Projects section"
    >
      <div className={LAYOUT_STYLES.container}>
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 pt-8 sm:pt-12">
          <h2 
            ref={titleRef}
            className={TYPOGRAPHY_STYLES.sectionTitle}
          >
            Work
          </h2>
        </div>

        {/* Editorial List */}
        <div className="divide-y divide-white/12">
          <AnimatePresence initial={false}>
          {visibleProjects.map((project, idx) => (
            <motion.div
              key={idx}
              initial={MOTION_VARIANTS.fadeUp.initial}
              whileInView={MOTION_VARIANTS.fadeUp.whileInView}
              viewport={MOTION_VARIANTS.fadeUp.viewport}
              transition={MOTION_VARIANTS.fadeUp.transition}
              className="group block py-12 md:py-16"
              style={{ willChange: 'transform, opacity' }}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center">
                {/* Index + Meta */}
                <div className="md:col-span-2 flex md:block items-center justify-between">
                  <div className="text-white/55 text-[11px] tracking-[0.3em] uppercase">
                    {String(idx + 1).padStart(2, '0')} — {project.category} / {project.year}
                  </div>
                </div>

                {/* Title + Description */}
                <div className="md:col-span-6 order-2 md:order-none">
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-white transition-colors duration-300">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-sm md:text-base text-white/60 max-w-prose md:max-w-[60ch]">
                    {project.description}
                  </p>
                  {/* Tech stack chips */}
                  {project.technologies?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.technologies.slice(0, 6).map((tech) => (
                        <span key={tech} className="px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] border border-white/15 text-white/75">
                          {tech}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {(project.liveUrl || project.githubUrl) && (
                    <div className="mt-3 flex items-center gap-6 text-[11px] uppercase tracking-[0.3em] text-white/70">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-4 decoration-white/20 hover:decoration-white"
                        >
                          Live
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-4 decoration-white/20 hover:decoration-white"
                        >
                          GitHub
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Thumbnail */}
                <div className="md:col-span-4 order-1 md:order-none">
                  <div className="relative w-full aspect-[16/9] overflow-hidden bg-black">
                    <Image
                      src={project.logo}
                      alt={`${project.title} cover`}
                      fill
                      className="object-cover transition-opacity duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:opacity-90 grayscale"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>

        {/* Load more */}
        {visible < projects.length && (
          <div className="flex flex-col items-center gap-3 pt-8">
            <div className="text-xs text-white/60">
              Showing {visible} of {projects.length}
            </div>
            <button
              type="button"
              onClick={() => setVisible((v) => Math.min(v + 6, projects.length))}
              className={BUTTON_STYLES.primary}
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

