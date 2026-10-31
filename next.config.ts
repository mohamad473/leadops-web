import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // No ESLint setup in this project yet; type errors still fail the build.
  eslint: { ignoreDuringBuilds: true },
  serverExternalPackages: ['nodemailer'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'same-origin' }
        ]
      }
    ];
  }
};

export default nextConfig;
