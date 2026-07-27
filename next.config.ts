import type { NextConfig } from 'next';
import { getIndexingHeaderRules } from './src/shared/seo/indexing-policy';

export function createNextConfig(context?: string): NextConfig {
  return {
    async headers() {
      return getIndexingHeaderRules(context);
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

const nextConfig = createNextConfig(process.env.CONTEXT);

export default nextConfig;
