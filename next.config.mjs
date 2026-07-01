/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Lint warnings/errors shouldn't block production deploys for this MVP.
    // Type-checking (tsc) still runs, so real type bugs are still caught.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
