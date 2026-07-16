import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dkhkzijpe/**',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Limit referrer leakage
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Force HTTPS for 1 year in production
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // Disable unnecessary browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
          // Prevent Cross-Site Scripting (XSS)
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Content Security Policy — restrict resource origins
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Allow Next.js inline scripts and framer-motion
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Allow inline styles (needed for framer-motion and CSS-in-JS)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Allow fonts from Google and self
              "font-src 'self' https://fonts.gstatic.com",
              // Allow images from Cloudinary and self
              "img-src 'self' data: blob: https://res.cloudinary.com",
              // Allow API calls to Cloudinary for uploads only
              "connect-src 'self' https://api.cloudinary.com",
              // Prevent framing from any origin
              "frame-ancestors 'none'",
              // Prevent form submissions to external sites
              "form-action 'self'",
              // Only allow HTTPS
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
      // Long cache for static assets is handled automatically by Next.js.
      // Do NOT set Cache-Control here — overriding it breaks dev HMR.
    ];
  },
};

export default nextConfig;
