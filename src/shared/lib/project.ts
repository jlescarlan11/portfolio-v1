export function isIpLiteralHostname(hostname: string): boolean {
  return (
    /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) ||
    (hostname.startsWith('[') && hostname.endsWith(']'))
  );
}

export function isLocalHostname(hostname: string): boolean {
  const normalizedHostname = hostname.endsWith('.')
    ? hostname.slice(0, -1)
    : hostname;
  return (
    normalizedHostname === 'localhost' ||
    normalizedHostname.endsWith('.localhost') ||
    normalizedHostname.endsWith('.local') ||
    normalizedHostname.endsWith('.home.arpa')
  );
}

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
    return (
      parsedUrl.protocol === 'https:' &&
      !parsedUrl.username &&
      !parsedUrl.password &&
      !isIpLiteralHostname(parsedUrl.hostname) &&
      !isLocalHostname(parsedUrl.hostname)
    );
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
