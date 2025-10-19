'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { animate } from 'motion';
import { projectsData } from '@/app/data/projects';
import { BackButton } from '@/app/components/BackButton';
import { ProjectInfo } from '@/app/components/ProjectInfo';
import { DeviceView } from '@/app/components/DeviceView';
import { ImageGallery } from '@/app/components/ImageGallery';
import { BUTTON_STYLES, LAYOUT_STYLES, TYPOGRAPHY_STYLES, ANIMATION_STYLES } from '@/app/styles/shared';

export default function ProjectDetailPage() {
  const params = useParams();
  const contentRef = useRef<HTMLDivElement>(null);

  const project = projectsData.find((p) => p.id === params.id);

  useEffect(() => {
    if (!contentRef.current) return;
    
    const elements = contentRef.current.querySelectorAll('.animate-in');
    if (elements.length === 0) return;

    animate(
      elements,
      { opacity: [0, 1], transform: ['translateY(30px)', 'translateY(0)'] },
      { duration: 0.6, delay: 0.1 }
    );
  }, [project]);

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-light text-white mb-4">Project Not Found</h1>
          <Link 
            href="/#work"
            className={BUTTON_STYLES.primary}
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <BackButton />

      <div ref={contentRef} className="pt-20 px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          {/* Project Header */}
          <div className={`mb-12 md:mb-16 ${ANIMATION_STYLES.fadeIn}`} style={ANIMATION_STYLES.fadeInOpacity}>
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-4">
              {project.category} / {project.year}
            </div>
            <h1 className={TYPOGRAPHY_STYLES.projectTitle}>
              {project.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl">
              {project.fullDescription}
            </p>
          </div>

          <ProjectInfo
            client={project.client}
            year={project.year}
            technologies={project.technologies}
          />

          {/* Device Views */}
          <div className={`mb-16 md:mb-24 ${ANIMATION_STYLES.fadeIn}`} style={ANIMATION_STYLES.fadeInOpacity}>
            <h2 className="
              text-2xl md:text-3xl
              font-light
              tracking-tight
              text-white
              mb-8
            ">
              Responsive Views
            </h2>
            
            <div className="mb-8">
              <DeviceView
                label="Desktop"
                imageSrc={project.images.desktop}
                alt={`${project.title} - Desktop view`}
                aspectRatio="desktop"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <DeviceView
                label="Tablet"
                imageSrc={project.images.tablet}
                alt={`${project.title} - Tablet view`}
                aspectRatio="tablet"
              />
              <DeviceView
                label="Mobile"
                imageSrc={project.images.mobile}
                alt={`${project.title} - Mobile view`}
                aspectRatio="mobile"
              />
            </div>
          </div>

          <ImageGallery
            title="Additional Visuals"
            images={project.additionalImages}
            projectTitle={project.title}
          />

          {/* Navigation */}
          <div className={`
            flex items-center justify-center
            pt-16 md:pt-24
            border-t border-gray-900
            ${ANIMATION_STYLES.fadeIn}
          `} style={ANIMATION_STYLES.fadeInOpacity}>
            <Link
              href="/#work"
              className={BUTTON_STYLES.primary}
            >
              View All Projects
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

