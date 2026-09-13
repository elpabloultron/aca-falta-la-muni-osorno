import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isGithubPages ? '/aca-falta-la-muni-osorno' : '',
  assetPrefix: isGithubPages ? '/aca-falta-la-muni-osorno/' : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubPages ? '/aca-falta-la-muni-osorno' : '',
  },
};

export default nextConfig;
