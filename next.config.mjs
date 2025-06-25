/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://carter-portfolio.fyi https://www.carter-portfolio.fyi",
          },
        ],
      },
    ];
  },
};

export default nextConfig;