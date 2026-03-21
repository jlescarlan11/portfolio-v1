import Image from 'next/image';
import Link from 'next/link';
import type { ProjectRecord } from '@/features/projects/types';
import { Typography } from '@/shared/components/Typography';

interface ProjectCardProps {
  project: ProjectRecord;
  isActive: boolean;
}

export function ProjectCard({
  project,
  isActive
}: ProjectCardProps): React.JSX.Element {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block h-full w-full flex-shrink-0 px-3 transition-all duration-500 select-none-safe"
      draggable={false}
    >
      <div className="mb-4 w-full text-center">
        <Typography
          variant="body"
          className={`text-center transition-all duration-500 ${isActive ? 'text-foreground' : 'text-muted-foreground'} group-hover:text-foreground`}
        >
          {project.title}
        </Typography>
      </div>

      <div className="flex aspect-square w-full items-center justify-center overflow-hidden bg-surface transition-all duration-500">
        <div className="relative h-full w-full">
          <Image
            src={project.logo}
            alt={`${project.title} logo`}
            fill
            className="pointer-events-none-safe select-none-safe object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
            draggable={false}
          />
        </div>
      </div>
    </Link>
  );
}
