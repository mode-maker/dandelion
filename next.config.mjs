/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Заголовки для всех файлов из /public/events/*
  async headers() {
    return [
      {
        source: "/events/:file*",
        headers: [
          // Кэш на уровне CDN (s-maxage) — 1 год. В браузере max-age=0 (пусть решает CDN).
        { key: "Cache-Control", value: "public, max-age=0, s-maxage=31536000, immutable" },
          // Разрешим запросы диапазонов — корректная перемотка <video>.
          { key: "Accept-Ranges", value: "bytes" },
        ],
      },
    ];
  },
};

export default nextConfig;
