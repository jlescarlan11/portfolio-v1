import type { Project } from '../types/project';

interface CarouselIndicatorsProps {
  projects: Project[];
  currentIndex: number;
  onIndicatorClick: (index: number) => void;
}

export function CarouselIndicators({ 
  projects, 
  currentIndex, 
  onIndicatorClick 
}: CarouselIndicatorsProps) {
  return (
    <div className="flex items-center justify-center gap-2 mt-8 md:mt-12">
      {projects.map((project, index) => {
        const isActive = index === currentIndex;
        
        return (
          <button
            key={index}
            onClick={() => onIndicatorClick(index)}
            className={`
              h-[3px]
              transition-all duration-500 ease-out
              cursor-pointer
              rounded-full
              focus:outline-none focus:ring-2 focus:ring-white/50
              ${
                isActive
                  ? 'w-12 md:w-16 bg-white shadow-lg'
                  : 'w-6 md:w-8 bg-gray-700 hover:bg-gray-500 hover:w-8 md:hover:w-10'
              }
            `}
            aria-label={`Go to ${project.title}`}
            title={`Go to ${project.title}`}
          />
        );
      })}
    </div>
  );
}
