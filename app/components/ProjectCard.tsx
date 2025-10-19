import Link from 'next/link';
import Image from 'next/image';
import type { Project } from '../types/project';

interface ProjectCardProps {
  project: Project;
  isActive: boolean;
}

export function ProjectCard({ project, isActive }: ProjectCardProps) {
  return (
    <Link
      href={`/project/${project.id}`}
      className="
        flex-shrink-0
        w-full
        h-full
        group
        block
        transition-all duration-500
        flex flex-col items-center justify-center
        px-3
      "
      draggable={false}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      <div className="text-center mb-4 w-full">
        <h3 className={`
          text-sm md:text-base
          font-normal
          tracking-wide
          transition-all duration-500
          ${isActive ? 'text-white' : 'text-gray-600'}
          group-hover:text-white
          text-center
        `}>
          {project.title}
        </h3>
      </div>

      <div className="
        aspect-square
        w-full
        overflow-hidden
        bg-gray-900
        transition-all duration-500
        flex items-center justify-center
      ">
        <div className="relative w-full h-full">
          <Image
            src={project.logo}
            alt={`${project.title} logo`}
            fill
            className="
              object-cover
              transition-all duration-700
              group-hover:scale-105
              grayscale
              group-hover:grayscale-0
            "
            draggable={false}
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          />
        </div>
      </div>
    </Link>
  );
}
