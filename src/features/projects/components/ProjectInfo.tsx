import { Typography } from '@/shared/components/Typography';
import { formatMonthYear, isRenderableExternalUrl } from '@/shared/lib/project';
import { BUTTON_STYLES, SURFACE, TYPOGRAPHY_STYLES } from '@/shared/styles/shared';

interface ProjectInfoProps {
  client?: string;
  completedAt: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
}

export function ProjectInfo({
  client,
  completedAt,
  technologies,
  liveUrl,
  githubUrl
}: ProjectInfoProps): React.JSX.Element {
  const safeLiveUrl = isRenderableExternalUrl(liveUrl) ? liveUrl : undefined;
  const safeGithubUrl = isRenderableExternalUrl(githubUrl) ? githubUrl : undefined;
  const completedLabel = formatMonthYear(completedAt, 'long');

  return (
    <div className={`grid grid-cols-1 gap-8 border-b ${SURFACE.hairline} pb-12 md:grid-cols-3 md:gap-12 md:pb-16`}>
      {client ? (
        <div>
          <Typography variant="label" as="h2" className="mb-3 block">
            Client
          </Typography>
          <Typography variant="body">{client}</Typography>
        </div>
      ) : null}

      <div>
        <Typography variant="label" as="h2" className="mb-3 block">
          Completed
        </Typography>
        <Typography variant="body">
          <time dateTime={completedAt}>{completedLabel}</time>
        </Typography>
      </div>

      <div>
        <Typography variant="label" as="h2" className="mb-3 block">
          Technologies
        </Typography>
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <Typography
              key={tech}
              variant="label"
              as="span"
              className={`border ${SURFACE.hairline} px-3 py-2 text-muted-foreground`}
            >
              {tech}
            </Typography>
          ))}
        </div>
      </div>

      {(safeLiveUrl || safeGithubUrl) ? (
        <div className="mt-4 flex items-center gap-6 md:col-span-3">
          {safeLiveUrl ? (
            <a href={safeLiveUrl} target="_blank" rel="noreferrer" className={BUTTON_STYLES.primary}>
              <Typography variant="label" as="span">
                View live
              </Typography>
            </a>
          ) : null}
          {safeGithubUrl ? (
            <a
              href={safeGithubUrl}
              target="_blank"
              rel="noreferrer"
              className={`${TYPOGRAPHY_STYLES.linkSecondary} inline-flex items-center gap-2`}
            >
              GitHub
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
