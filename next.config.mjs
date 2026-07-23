import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Lint warnings/errors shouldn't block production deploys for this MVP.
    // Type-checking (tsc) still runs, so real type bugs are still caught.
    ignoreDuringBuilds: true,
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Source-map upload needs SENTRY_AUTH_TOKEN — without it this silently
  // skips upload (errors still report, just without de-minified stack
  // traces) rather than failing the build.
  silent: true,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
