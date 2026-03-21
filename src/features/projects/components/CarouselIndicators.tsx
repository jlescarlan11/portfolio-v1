import type { ProjectRecord } from '@/features/projects/types';

interface CarouselIndicatorsProps {
  projects: ProjectRecord[];
  currentIndex: number;
  onIndicatorClick: (index: number) => void;
}

export function CarouselIndicators({
  projects,
  currentIndex,
  onIndicatorClick
}: CarouselIndicatorsProps): React.JSX.Element {
  return (
    <div className="mt-8 flex items-center justify-center gap-2 md:mt-12">
      {projects.map((project, index) => {
        const isActive = index === currentIndex;

        return (
          <button
            key={project.slug}
            onClick={() => onIndicatorClick(index)}
            className={`
              h-1
              cursor-pointer
              transition-all duration-500 ease-out
              focus:outline-none focus:ring-2 focus:ring-foreground/50
              ${
                isActive
                  ? 'w-12 bg-foreground md:w-16'
                  : 'w-6 bg-surface-tint-strong hover:w-8 hover:bg-surface-divider md:w-8 md:hover:w-10'
              }
            `}
            aria-label={`Go to ${project.title}`}
            title={`Go to ${project.title}`}
            type="button"
          />
        );
      })}
    </div>
  );
}
