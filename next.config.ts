import type { NextConfig } from 'next';
import { getIndexingHeaderRules } from './src/shared/seo/indexing-policy';

const SECURITY_HEADERS = [
  {
    key: 'Content-Security-Policy',
    value:
      "base-uri 'self'; connect-src 'self'; default-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'none'; frame-src 'none'; img-src 'self' data:; media-src 'none'; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; worker-src 'none'"
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), geolocation=(), microphone=()'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  }
];

export function createNextConfig(
  context?: string,
  vercelEnvironment?: string
): NextConfig {
  return {
    poweredByHeader: false,
    async headers() {
      const indexingHeaders = getIndexingHeaderRules(
        context,
        vercelEnvironment
      ).flatMap(rule => rule.headers);

      return [
        {
          source: '/:path*',
          headers: [...SECURITY_HEADERS, ...indexingHeaders]
        }
      ];
    },
    async redirects() {
      return [
        {
          source: '/project/John_Lester_Escarlan_Resume.pdf',
          destination: '/John_Lester_Escarlan_Resume.pdf',
          permanent: true
        }
      ];
    }
  };
}

const nextConfig = createNextConfig(
  process.env.CONTEXT,
  process.env.VERCEL_ENV
);

export default nextConfig;
