'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight } from 'react-icons/fi';
import type { ProjectRecord } from '../types';

import { projectStories } from '../stories';

type ProjectPreview = Pick<ProjectRecord, 'slug' | 'title' | 'description'> & {
  listing: Pick<ProjectRecord['listing'], 'thumbnail'>;
};

function Thumbnail({ project, decorative = false }: { project: ProjectPreview; decorative?: boolean }): React.JSX.Element {
  const thumbnail = project.listing.thumbnail;
  return (
    <span className="project-thumbnail">
      <Image
        src={thumbnail.src}
        alt={decorative ? '' : thumbnail.alt.replace(/^Orange /, '')}
        fill
        sizes="(max-width: 760px) 280px, 400px"
        className={thumbnail.fit === 'contain' ? 'object-contain p-4' : 'object-cover'}
        style={{ objectPosition: thumbnail.objectPosition ?? 'center' }}
      />
    </span>
  );
}

export default function ProjectDeck({ projects }: { projects: ProjectPreview[] }): React.JSX.Element | null {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCard = useRef<HTMLElement>(null);
  const featured = projects[activeIndex];
  const story = featured ? projectStories[featured.slug] : undefined;
  function selectProject(index: number): void {
    setActiveIndex(index);
    activeCard.current?.focus({ preventScroll: true });
  }
  const right = projects.length > 1 ? projects[(activeIndex + 1) % projects.length] : undefined;
  const left = projects.length > 2 ? projects[(activeIndex + projects.length - 1) % projects.length] : undefined;
  if (!featured) return null;

  return (
    <section id="work" className="portfolio-container portfolio-section project-showcase" aria-labelledby="projects-heading">
      <span id="projects" />
      <div className="section-heading">
        <h2 id="projects-heading" className="h2">What I’ve built and learned</h2>
        <Link href="/projects" className="portfolio-link">All projects<FiArrowRight aria-hidden="true" /></Link>
      </div>
      <div className="project-deck" aria-label="Featured projects">
        {[left, right].map((project, index) => project && (
          <button
            key={project.slug}
            type="button"
            aria-label={`Show ${project.title}`}
            onClick={() => {
              selectProject(projects.findIndex(item => item.slug === project.slug));
            }}
            className={`project-preview ${index === 0 ? 'preview-left' : 'preview-right'}`}
          >
            <Thumbnail project={project} decorative />
            <span className="block font-medium">{project.title}</span>
            <span className="mt-3 block text-muted-foreground">{projectStories[project.slug]?.kind ?? project.description}</span>
          </button>
        ))}
        <article ref={activeCard} tabIndex={-1} className="project-active" aria-label={featured.title} aria-live="polite">
          <Thumbnail project={featured} />
          <h3 className="font-medium">{featured.title}</h3>
          <p className="mt-2 text-muted-foreground">{story?.kind}</p>
          <p className="mt-4 text-muted-foreground">{story?.preview ?? featured.description}</p>
          {story && <p className="mt-4 border-t border-surface pt-4 text-muted-foreground">{story.lesson}</p>}
          <Link href={`/projects/${featured.slug}`} className="portfolio-button mt-6">
            Read the story<FiArrowRight aria-hidden="true" />
          </Link>
        </article>
      </div>
      <div className="project-selectors" role="group" aria-label="Choose a project story">
        {projects.map((project, index) => <button key={project.slug} type="button" className="portfolio-link" aria-label={`Select ${project.title}`} aria-pressed={index === activeIndex} onClick={() => selectProject(index)}>{project.title}</button>)}
      </div>
    </section>
  );
}
