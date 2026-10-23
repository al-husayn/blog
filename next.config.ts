import type { NextConfig } from 'next';
import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

const nextConfig: NextConfig = {
    transpilePackages: ['geist'],
    turbopack: {
        root: process.cwd(),
    },
};

export default withMDX(nextConfig);
