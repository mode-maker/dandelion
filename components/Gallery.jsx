// app/components/Gallery.jsx
import { list } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export default async function Gallery() {
  const { blobs } = await list({ prefix: 'gallery/', limit: 200 });
  const items = [...blobs].sort((a, b) =>
    a.uploadedAt < b.uploadedAt ? 1 : -1
  );

  return (
    <section className="py-12 md:py-16">
      {/* контейнер по центру как у остальных секций */}
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* заголовок: тот же размер и вес, по центру */}
        <h2 className="text-center text-2xl md:text-3xl font-semibold tracking-tight">
          Галерея
        </h2>

        {/* сетка карточек: аккуратнее и чуть меньше */}
        <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((b) => (
            <figure
              key={b.url}
              className="
                overflow-hidden rounded-2xl
                border border-neutral-800
                bg-neutral-900/30
                shadow-lg shadow-black/20
                transition-transform duration-200 hover:scale-[1.01]
              "
            >
              {/* фиксированная аккуратная высота карточек */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.url}
                alt=""
                loading="lazy"
                className="w-full h-56 md:h-64 object-cover"
              />
            </figure>
          ))}

          {items.length === 0 && (
            <p className="col-span-full text-center text-neutral-400">
              Пока нет фотографий.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
