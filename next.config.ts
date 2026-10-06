type NextConfig = {
  reactStrictMode?: boolean;
  poweredByHeader?: boolean;
  output?: 'standalone' | 'export';
  headers?: () => Promise<Array<{
    source: string;
    headers: Array<{ key: string; value: string }>;
  }>>;
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Permissions-Policy', value: 'geolocation=(self)' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
