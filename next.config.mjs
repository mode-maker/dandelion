/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      // Vercel Blob
      { protocol: 'https', hostname: 'blob.vercel-storage.com' },
      // Если у тебя есть ещё домены с картинками — добавь тут
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
