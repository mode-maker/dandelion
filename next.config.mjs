/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    // Разрешаем ВСЕ поддомены Vercel Blob, в т.ч. public.*
    remotePatterns: [
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: '**.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'blob.vercel-storage.com' }, // на всякий случай
    ],
  },

  async headers() {
    return [
      {
        source: "/events/:file*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=31536000, immutable" },
          { key: "Accept-Ranges", value: "bytes" },
        ],
      },
    ];
  },
};

export default nextConfig;
