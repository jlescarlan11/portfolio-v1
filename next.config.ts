import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/project/John_Lester_Escarlan_Resume.pdf",
        destination: "/John_Lester_Escarlan_Resume.pdf",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
