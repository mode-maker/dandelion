// app/admin/page.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function formatRuDate(d) {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(+date)) return '';
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}

function normalizePhoto(p) {
  return {
    id: p.id,
    url: p.url || p.src || '',
    published: typeof p.published === 'boolean' ? p.published :
               typeof p.is_published === 'boolean' ? p.is_published : true,
    albumId: p.albumId ?? p.album_id ?? null,
    sortIndex: p.sort_index ?? p.sortIndex ?? null,
  };
}

function normalizeAlbum(a) {
  return {
    id: a.id,
    title: a.title ?? a.name ?? `Альбом #${a.id}`,
    event_date: a.event_date ?? a.date ?? null,
    photos: Array.isArray(a.photos) ? a.photos.map(normalizePhoto) : [],
  };
}

export default function AdminAlbums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const stripRefs = useRef([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Публичный API — всегда без авторизации, поэтому превью не пустеют
        const data = await fetch('/api/albums', { cache: 'no-store' }).then(r => r.json()).catch(() => []);
        const list = Array.isArray(data) ? data.map(normalizeAlbum) : [];
        setAlbums(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const scrollBy = (ai, dir = 1) => {
    const el = stripRefs.current[ai];
    if (!el) return;
    el.scrollBy({ left: Math.round(el.clientWidth * 0.85) * dir, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg-0)]">
      <style jsx global>{`
        .no-scrollbar{ -ms-overflow-style:none; scrollbar-width:none; }
        .no-scrollbar::-webkit-scrollbar{ display:none; }
      `}</style>

      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        <h1 className="text-2xl md:text-3xl font-semibold text-[color:var(--aurora-3)] text-center">Админ · Альбомы</h1>

        {loading && <p className="mt-6 text-center text-white/70">Загружаем…</p>}

        {!loading && (
          <section className="mt-8 space-y-8">
            {albums.map((a, ai) => (
              <div key={a.id} className="relative rounded-2xl bg-black/10 ring-1 ring-white/5 shadow-lg shadow-black/20 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="text-[#E7E8E0] text-base md:text-lg font-medium">{a.title}</div>
                    {a.event_date && <div className="text-[#E7E8E0]/70 text-xs md:text-sm">{formatRuDate(a.event_date)}</div>}
                  </div>
                  <Link href={`/admin/albums/${a.id}`} className="px-3 py-1.5 rounded-xl bg-[#556B5A] hover:bg-[#5e7569] text-white">Открыть</Link>
                </div>

                <div className="px-4 pb-4">
                  <div ref={(el) => (stripRefs.current[ai] = el)} className="no-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory">
                    {a.photos.map((p) => (
                      <figure key={p.id} className="min-w-[300px] md:min-w-[420px] snap-start rounded-2xl overflow-hidden bg-black/10 ring-1 ring-white/5 shadow-md">
                        <img src={p.url} className="w-full h-56 object-cover" alt="" />
                      </figure>
                    ))}
                    {a.photos.length === 0 && <div className="text-white/70 px-2 py-4">Опубликованных фото нет.</div>}
                  </div>
                </div>

                <button onClick={() => scrollBy(ai, -1)} className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center rounded-full bg-black/40 backdrop-blur ring-1 ring-white/10 text-white hover:bg-black/55">←</button>
                <button onClick={() => scrollBy(ai, 1)} className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center rounded-full bg-black/40 backdrop-blur ring-1 ring-white/10 text-white hover:bg-black/55">→</button>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
