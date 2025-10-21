interface ProjectInfoProps {
  client: string;
  year: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
}

export function ProjectInfo({ client, year, technologies, liveUrl, githubUrl }: ProjectInfoProps) {
  return (
    <div className="
      grid grid-cols-1 md:grid-cols-3
      gap-8 md:gap-12
      mb-16 md:mb-24
      pb-16 md:pb-24
      border-b border-white/12
      animate-in
    " style={{ opacity: 0 }}>
      <div>
        <h3 className="text-sm uppercase tracking-wider text-white/60 mb-3">
          Client
        </h3>
        <p className="text-base text-white">{client}</p>
      </div>
      
      <div>
        <h3 className="text-sm uppercase tracking-wider text-white/60 mb-3">
          Year
        </h3>
        <p className="text-base text-white">{year}</p>
      </div>
      
      <div>
        <h3 className="text-sm uppercase tracking-wider text-white/60 mb-3">
          Technologies
        </h3>
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="
                px-3 py-1
                text-xs uppercase tracking-wider
                border border-white/15
                text-white/75
              "
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
      {(liveUrl || githubUrl) && (
        <div className="md:col-span-3 flex items-center gap-4">
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block px-4 py-2 text-[11px] uppercase tracking-[0.3em] border border-white/80 text-white hover:bg-white/10 transition-colors"
            >
              View live
            </a>
          )}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-white/80 hover:text-white underline underline-offset-4 decoration-transparent hover:decoration-white transition-colors"
            >
              GitHub
            </a>
          )}
        </div>
      )}
    </div>
  );
}
