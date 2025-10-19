interface ProjectInfoProps {
  client: string;
  year: string;
  technologies: string[];
}

export function ProjectInfo({ client, year, technologies }: ProjectInfoProps) {
  return (
    <div className="
      grid grid-cols-1 md:grid-cols-3
      gap-8 md:gap-12
      mb-16 md:mb-24
      pb-16 md:pb-24
      border-b border-gray-900
      animate-in
    " style={{ opacity: 0 }}>
      <div>
        <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-3">
          Client
        </h3>
        <p className="text-base text-white">{client}</p>
      </div>
      
      <div>
        <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-3">
          Year
        </h3>
        <p className="text-base text-white">{year}</p>
      </div>
      
      <div>
        <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-3">
          Technologies
        </h3>
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="
                px-3 py-1
                text-xs uppercase tracking-wider
                border border-gray-700
                text-gray-400
              "
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
