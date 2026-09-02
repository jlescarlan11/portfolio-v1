export function isCanonicalRedirect(
  destination,
  sourceUrl,
  canonicalOrigin,
  canonicalPath
) {
  if (typeof destination !== 'string') return false;

  try {
    const destinationUrl = new URL(destination, sourceUrl);
    return (
      destinationUrl.origin === canonicalOrigin &&
      destinationUrl.username === '' &&
      destinationUrl.password === '' &&
      destinationUrl.pathname === canonicalPath &&
      destinationUrl.search === '' &&
      destinationUrl.hash === ''
    );
  } catch {
    return false;
  }
}

export function isCanonicalHttpsRootRedirect(
  destination,
  sourceUrl,
  canonicalOrigin
) {
  return isCanonicalRedirect(
    destination,
    sourceUrl,
    canonicalOrigin,
    '/'
  );
}

export function hasOnlyCanonicalSitemapLocations(xml, canonicalOrigin) {
  const matches = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g));
  if (matches.length === 0) return false;

  return matches.every(([, value]) => {
    try {
      const location = new URL(value.trim());
      return (
        location.origin === canonicalOrigin &&
        location.username === '' &&
        location.password === ''
      );
    } catch {
      return false;
    }
  });
}
