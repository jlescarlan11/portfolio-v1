export const NOINDEX_DIRECTIVE = 'noindex, nofollow';

export interface IndexingHeaderRule {
  source: string;
  headers: Array<{
    key: string;
    value: string;
  }>;
}

/**
 * Netlify injects CONTEXT as immutable build metadata. Missing CONTEXT is the
 * deterministic local/non-Netlify case; unknown Netlify contexts fail closed.
 */
export function shouldPreventIndexing(context?: string): boolean {
  const normalizedContext = context?.trim() || undefined;

  switch (normalizedContext) {
    case 'deploy-preview':
    case 'branch-deploy':
      return true;
    case 'production':
    case 'dev':
    case undefined:
      return false;
    default:
      return true;
  }
}

export function getIndexingHeaderRules(
  context?: string
): IndexingHeaderRule[] {
  if (!shouldPreventIndexing(context)) {
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
