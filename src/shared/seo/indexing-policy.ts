export const NOINDEX_DIRECTIVE = 'noindex, nofollow';

export interface IndexingHeaderRule {
  source: string;
  headers: Array<{
    key: string;
    value: string;
  }>;
}

/**
 * Netlify and Vercel inject immutable build metadata. Missing values are the
 * deterministic local/other-provider case; unknown provider values fail closed.
 */
export function shouldPreventIndexing(
  context?: string,
  vercelEnvironment?: string
): boolean {
  const normalizedContext = context?.trim() || undefined;

  switch (normalizedContext) {
    case 'deploy-preview':
    case 'branch-deploy':
      return true;
    case 'production':
    case 'dev':
    case undefined:
      break;
    default:
      return true;
  }

  const normalizedVercelEnvironment =
    vercelEnvironment?.trim() || undefined;

  switch (normalizedVercelEnvironment) {
    case 'preview':
      return true;
    case 'production':
    case 'development':
    case undefined:
      return false;
    default:
      return true;
  }
}

export function getIndexingHeaderRules(
  context?: string,
  vercelEnvironment?: string
): IndexingHeaderRule[] {
  if (!shouldPreventIndexing(context, vercelEnvironment)) {
    return [];
  }

  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Robots-Tag',
          value: NOINDEX_DIRECTIVE
        }
      ]
    }
  ];
}
