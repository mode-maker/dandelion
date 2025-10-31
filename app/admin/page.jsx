// app/admin/page.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function formatRuDate(d) {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(+date)) return '';
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default function AdminAlbums() {
  const [albums, setAlbums] = useState([]);
  const [photosMap, setPhotosMap] = useState({}); // { [albumId]: photos[] }
  const [loading, setLoading] = useState(true);
  const stripRefs = useRef([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // список альбомов (админ)
        const a = await fetch('/api/admin/albums', { cache: 'no-store' })
          .then(r => r.json()).catch(() => []);
        const list = Array.isArray(a) ? a : [];
        setAlbums(list);

        // подкачиваем опубликованные фото для превью (как на сайте)
        const map = {};
        await Promise.all(list.map(async (al) => {
          const p = await fetch(`/api/admin/photos?albumId=${al.id}`, { cache: 'no-store' })
            .then(r => r.json()).catch(() => []);
          // В админ-превью показываем только опубликованные (так выглядит на сайте)
          map[al.id] = Array.isArray(p) ? p.filter(x => x.published) : [];
        }));
        setPhotosMap(map);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // стрелки прокрутки ленты
  const scrollBy = (ai, dir = 1) => {
    const el = stripRefs.current[ai];
    if (!el) return;
    const step = Math.round(el.clientWidth * 0.85);
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg-0)]">
      {/* скрываем нижние скроллбары у лент */}
      <style jsx global>{`
        .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
        .no-scrollbar::-webkit-scrollbar { display:none; }
      `}</style>

      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        <h1 className="text-2xl md:text-3xl font-semibold text-[color:var(--aurora-3)] text-center">
          Админ · Альбомы
        </h1>

        {loading && (
          <p className="mt-6 text-center text-white/70">Загружаем…</p>
        )}

        {!loading && (
          <section className="mt-8 space-y-8">
            {albums.map((a, ai) => (
              <div key={a.id} className="relative rounded-2xl bg-black/10 ring-1 ring-white/5 shadow-lg shadow-black/20">
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="text-[#E7E8E0] text-base md:text-lg font-medium">
                      {a.title || `Альбом #${a.id}`}
                    </div>
                    {a.event_date && (
                      <div className="text-[#E7E8E0]/70 text-xs md:text-sm">
                        {formatRuDate(a.event_date)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/albums/${a.id}`}
                      className="px-3 py-1.5 rounded-xl bg-[#556B5A] hover:bg-[#5e7569] text-white"
                    >
                      Открыть
                    </Link>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <div
                    ref={(el) => (stripRefs.current[ai] = el)}
                    className="no-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory"
                  >
                    {(photosMap[a.id] || []).map((p) => (
                      <figure
                        key={p.id}
                        className="min-w-[300px] md:min-w-[420px] snap-start rounded-2xl overflow-hidden bg-black/10 ring-1 ring-white/5 shadow-md"
                        title={`id ${p.id}`}
                      >
                        <img src={p.url} className="w-full h-56 object-cover" alt="" />
                      </figure>
                    ))}
                    {(photosMap[a.id] || []).length === 0 && (
                      <div className="text-white/70 px-2 py-4">Опубликованных фото нет.</div>
                    )}
                  </div>
                </div>

                {/* стрелки поверх ленты */}
                <button
                  onClick={() => scrollBy(ai, -1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center rounded-full bg-black/40 backdrop-blur ring-1 ring-white/10 text-white hover:bg-black/55"
                  aria-label="Назад"
                >←</button>
                <button
                  onClick={() => scrollBy(ai, 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center rounded-full bg-black/40 backdrop-blur ring-1 ring-white/10 text-white hover:bg-black/55"
                  aria-label="Вперёд"
                >→</button>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
