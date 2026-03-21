export function isRenderableExternalUrl(url?: string): url is string {
  if (!url) {
    return false;
  }

  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return false;
  }

  if (/^replace/i.test(trimmedUrl) || trimmedUrl.includes('REPLACE_WITH_')) {
    return false;
  }

  try {
    const parsedUrl = new URL(trimmedUrl);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

export function formatMonthYear(
  value: string,
  month: 'short' | 'long' = 'short'
): string {
  return new Intl.DateTimeFormat('en-US', {
    month,
    year: 'numeric'
  }).format(new Date(`${value}-01T00:00:00`));
}
