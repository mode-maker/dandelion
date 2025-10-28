// app/components/Gallery.jsx
import { list } from '@vercel/blob';

// всегда свежие данные из Blob Store
export const dynamic = 'force-dynamic';

export default async function Gallery() {
  // читаем все файлы из папки "gallery/"
  const { blobs } = await list({
    prefix: 'gallery/',   // мы так и загружаем: gallery/<timestamp>-<name>
    limit: 200,           // сколько показывать максимум
  });

  if (!blobs.length) {
    return (
      <section className="py-12">
        <h2 className="text-2xl font-semibold mb-4">Галерея</h2>
        <p className="text-neutral-400">Пока нет фотографий.</p>
      </section>
    );
  }

  // хотим новые выше — blobs уже обычно в порядке по времени, но перестрахуемся
  const items = blobs.sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));

  return (
    <section className="py-12">
      <h2 className="text-2xl font-semibold mb-6">Галерея</h2>
      {/* простая masonry сетка через CSS columns */}
      <div className="columns-1 sm:columns-2 md:columns-3 gap-4 [column-fill:_balance]">
        {items.map((b) => (
          <figure key={b.url} className="mb-4 break-inside-avoid rounded-xl overflow-hidden border border-neutral-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.url} alt="" className="w-full h-auto object-cover" loading="lazy" />
          </figure>
        ))}
      </div>
    </section>
  );
}
