/**
 * Next.js Configuration
 * 
 * This file configures Next.js build and runtime settings.
 * See: https://nextjs.org/docs/app/api-reference/config/next-config-js
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ==========================================================================
  // PRODUCTION SETTINGS
  // ==========================================================================
  
  output: 'standalone',     // Creates minimal deployment bundle
  outputFileTracingRoot: __dirname, // Fix multiple lockfiles warning
  compress: true,           // Enable gzip compression
  poweredByHeader: false,   // Remove "X-Powered-By: Next.js" header
  reactStrictMode: true,    // Enable React strict mode
  
  // Transpile ESM packages
  transpilePackages: ['@lobehub/tts'],

  // ==========================================================================
  // SECURITY HEADERS
  // ==========================================================================
  
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=(self)' },
        ],
      },
      {
        // CORS headers for API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      {
        // Cache static assets for 1 year (immutable)
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache images for 1 month
        source: '/:all*.(jpg|jpeg|png|svg|gif|webp|avif|ico)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, must-revalidate' },
        ],
      },
      {
        // Cache Service Worker
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },

  // ==========================================================================
  // IMAGE OPTIMIZATION
  // ==========================================================================
  
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'hjegsngsrwwbddbujvxe.supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
    ],
  },

  // ==========================================================================
  // EXPERIMENTAL FEATURES
  // ==========================================================================
  
  experimental: {
    // Optimize imports for faster builds
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      'recharts',
    ],
    // Allow large image uploads (10MB for homework photos)
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // ==========================================================================
  // ESLINT CONFIGURATION
  // ==========================================================================

  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during production builds
  },
};

module.exports = nextConfig;
