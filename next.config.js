const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Legacy AWS S3 bucket (if still needed)
      {
        protocol: 'https',
        hostname: 'resound-test-images.s3.us-east-2.amazonaws.com',
      },
      // UploadThing V7 - Your actual APP_ID
      {
        protocol: 'https',
        hostname: 'zxhzgdtrr2.ufs.sh',
        pathname: '/f/*',
      },
      // UploadThing V6 legacy (deprecated but still supported)
      {
        protocol: 'https',
        hostname: 'utfs.io',
        pathname: '/f/*',
      },
      // Remove wildcard for security - add specific domains as needed
    ],
  },
  productionBrowserSourceMaps: false,
};

module.exports = withBundleAnalyzer(nextConfig);
