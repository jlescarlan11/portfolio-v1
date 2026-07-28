const canonicalOrigin = 'https://johnlesterescarlan.pro';
const baseUrl = (
  process.env.CUTOVER_BASE_URL ?? canonicalOrigin
).replace(/\/$/, '');
const previewUrl = process.env.CUTOVER_PREVIEW_URL?.replace(/\/$/, '');
const isCanonicalProduction = baseUrl === canonicalOrigin;

const failures = [];

function pass(message) {
  console.log(`PASS ${message}`);
}

function fail(message) {
  failures.push(message);
  console.error(`FAIL ${message}`);
}

function check(condition, message) {
  if (condition) pass(message);
  else fail(message);
}

async function request(url, init) {
  try {
    return await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(20_000),
      ...init
    });
  } catch (error) {
    fail(
      `${url} could not be reached: ${
        error instanceof Error ? error.message : 'unknown network error'
      }`
    );
    return undefined;
  }
}

function hasCanonicalMetadata(html) {
  const canonicalWithSlash = `${canonicalOrigin}/`;
  return (
    (html.includes(`rel="canonical" href="${canonicalOrigin}"`) ||
      html.includes(`rel="canonical" href="${canonicalWithSlash}"`)) &&
    (html.includes(`property="og:url" content="${canonicalOrigin}"`) ||
      html.includes(
        `property="og:url" content="${canonicalWithSlash}"`
      )) &&
    html.includes(
      `name="twitter:image" content="${canonicalOrigin}/hero-image.jpg"`
    ) &&
    html.includes(`${canonicalOrigin}/hero-image.jpg`) &&
    html.includes('application/ld+json') &&
    html.includes(`"url":"${canonicalWithSlash}"`)
  );
}

const homepage = await request(`${baseUrl}/`);

if (homepage) {
  const html = await homepage.text();
  const server = homepage.headers.get('server')?.toLowerCase() ?? '';
  const robotsHeader =
    homepage.headers.get('x-robots-tag')?.toLowerCase() ?? '';
  const contentSecurityPolicy =
    homepage.headers.get('content-security-policy') ?? '';
  const permissionsPolicy = homepage.headers.get('permissions-policy') ?? '';

  check(homepage.status === 200, 'the apex homepage returns HTTP 200');
  check(
    server.includes('vercel') || homepage.headers.has('x-vercel-id'),
    'the apex homepage is served by Vercel'
  );
  check(
    contentSecurityPolicy.includes("frame-ancestors 'none'"),
    'Content-Security-Policy is present'
  );
  check(
    permissionsPolicy.includes('camera=()') &&
      permissionsPolicy.includes('geolocation=()') &&
      permissionsPolicy.includes('microphone=()'),
    'Permissions-Policy is present'
  );
  check(
    homepage.headers.get('referrer-policy') ===
      'strict-origin-when-cross-origin',
    'Referrer-Policy is preserved'
  );
  check(
    homepage.headers.get('strict-transport-security')?.includes('max-age='),
    'HSTS is present'
  );
  check(
    homepage.headers.get('x-content-type-options') === 'nosniff',
    'X-Content-Type-Options is preserved'
  );
  check(
    homepage.headers.get('x-frame-options') === 'DENY',
    'frame denial is preserved'
  );
  if (isCanonicalProduction) {
    check(
      !robotsHeader.includes('noindex') &&
        !robotsHeader.includes('nofollow'),
      'production does not emit a noindex or nofollow header'
    );
  } else {
    check(
      robotsHeader.includes('noindex') &&
        robotsHeader.includes('nofollow'),
      'the candidate Vercel Preview emits noindex, nofollow'
    );
  }
  check(
    hasCanonicalMetadata(html),
    'canonical, social, and structured-data URLs use the apex origin'
  );
  check(
    html.includes('Pharmacy &amp; Acute Care University') &&
      html.includes('Aug 2026'),
    'the PACU experience ends in August 2026'
  );
  check(
    html.includes('pre-launch two-sided camera rental marketplace') &&
      html.includes('three-workflow n8n system'),
    'the resume-aligned project descriptions are present'
  );
}

const projectPath = '/projects/rent-n-roll';
const project = await request(`${baseUrl}${projectPath}`);
if (project) {
  check(project.status === 200, 'a representative project route returns HTTP 200');
}

const resume = await request(
  `${baseUrl}/John_Lester_Escarlan_Resume.pdf`,
  { method: 'HEAD' }
);
if (resume) {
  check(resume.status === 200, 'the current resume PDF returns HTTP 200');
  check(
    resume.headers.get('content-type')?.includes('application/pdf'),
    'the current resume has a PDF content type'
  );
}

const legacyResume = await request(
  `${baseUrl}/project/John_Lester_Escarlan_Resume.pdf`,
  { method: 'HEAD' }
);
if (legacyResume) {
  const destination = legacyResume.headers.get('location');
  check(
    [301, 308].includes(legacyResume.status),
    'the legacy resume URL returns a permanent redirect'
  );
  check(
    destination !== null &&
      new URL(destination, baseUrl).pathname ===
        '/John_Lester_Escarlan_Resume.pdf',
    'the legacy resume redirect targets the current PDF'
  );
}

const robots = await request(`${baseUrl}/robots.txt`);
if (robots) {
  const body = await robots.text();
  check(robots.status === 200, 'robots.txt returns HTTP 200');
  check(
    body.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`),
    'robots.txt points to the canonical sitemap'
  );
}

const sitemap = await request(`${baseUrl}/sitemap.xml`);
if (sitemap) {
  const body = await sitemap.text();
  check(sitemap.status === 200, 'sitemap.xml returns HTTP 200');
  check(
    body.includes(canonicalOrigin) &&
      !body.includes('.netlify.app') &&
      !body.includes('.vercel.app'),
    'the sitemap contains only canonical production URLs'
  );
}

if (isCanonicalProduction) {
  const wwwRedirect = await request(
    `https://www.johnlesterescarlan.pro${projectPath}`
  );
  if (wwwRedirect) {
    const destination = wwwRedirect.headers.get('location');
    check(
      [301, 308].includes(wwwRedirect.status),
      'www returns a permanent redirect'
    );
    check(
      destination === `${canonicalOrigin}${projectPath}`,
      'www redirects to the same path on the apex domain'
    );
  }

  const httpRedirect = await request('http://johnlesterescarlan.pro/');
  if (httpRedirect) {
    const destination = httpRedirect.headers.get('location');
    check(
      [301, 308].includes(httpRedirect.status),
      'plain HTTP returns a permanent redirect'
    );
    check(
      destination !== null &&
        new URL(destination, canonicalOrigin).protocol === 'https:',
      'plain HTTP redirects to HTTPS'
    );
  }
} else {
  console.log(
    'SKIP custom-domain redirect checks; run again against the apex after DNS cutover.'
  );
}

if (previewUrl && previewUrl !== baseUrl) {
  const preview = await request(`${previewUrl}/`);
  if (preview) {
    const robotsHeader =
      preview.headers.get('x-robots-tag')?.toLowerCase() ?? '';
    check(preview.status === 200, 'the Vercel Preview homepage returns HTTP 200');
    check(
      robotsHeader.includes('noindex') &&
        robotsHeader.includes('nofollow'),
      'the Vercel Preview response emits noindex, nofollow'
    );
  }
} else {
  console.log(
    isCanonicalProduction
      ? 'SKIP separate Preview indexing check; set CUTOVER_PREVIEW_URL to a Vercel Preview origin.'
      : 'SKIP separate Preview indexing check; CUTOVER_BASE_URL is already a Preview origin.'
  );
}

if (failures.length > 0) {
  console.error(`\n${failures.length} cutover check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('\nAll requested cutover checks passed.');
}
