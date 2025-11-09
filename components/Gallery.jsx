// components/Gallery.jsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const PUBLIC_GALLERY_API = '/api/public/gallery';

export default function Gallery() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null); // { albumIdx, photoIdx }
  const scrollersRef = useRef({});

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(PUBLIC_GALLERY_API, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const normalized = Array.isArray(data?.albums) ? data.albums : data;

        const prepared = (normalized || []).map((a) => {
          const photos = (a.photos || [])
            .filter((p) => p?.published !== false)
            .sort((p1, p2) => (p1.sort_index ?? 0) - (p2.sort_index ?? 0));
          return { ...a, photos };
        });

        if (alive) setAlbums(prepared);
      } catch (e) {
        console.error('Gallery load error:', e);
        if (alive) setAlbums([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const open = useCallback((albumIdx, photoIdx) => {
    setLightbox({ albumIdx, photoIdx });
  }, []);
  const close = useCallback(() => setLightbox(null), []);
  const prev = useCallback(() => {
    if (!lightbox) return;
    const a = albums[lightbox.albumIdx];
    if (!a) return;
    const count = a.photos.length;
    if (!count) return;
    setLightbox((lb) => ({
      albumIdx: lb.albumIdx,
      photoIdx: (lb.photoIdx - 1 + count) % count,
    }));
  }, [lightbox, albums]);
  const next = useCallback(() => {
    if (!lightbox) return;
    const a = albums[lightbox.albumIdx];
    if (!a) return;
    const count = a.photos.length;
    if (!count) return;
    setLightbox((lb) => ({
      albumIdx: lb.albumIdx,
      photoIdx: (lb.photoIdx + 1) % count,
    }));
  }, [lightbox, albums]);

  const lightboxSrc = useMemo(() => {
    if (!lightbox) return null;
    const a = albums[lightbox.albumIdx];
    const p = a?.photos?.[lightbox.photoIdx];
    return p?.url || null;
  }, [lightbox, albums]);

  // ——————————————————————————————————————————————————————————
  //   Ц Е Н Т Р И Р О В К А  В С Е Г О  Б Л О К А
  // container: max-w-7xl mx-auto px-*
  // заголовок и описание: text-center
  // сетки фото: justify-center + justify-items-center
  // ——————————————————————————————————————————————————————————

  if (loading) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-white/90">
            Галерея
          </h2>
          <p className="mt-2 text-center text-white/60">
            Загрузка…
          </p>
        </div>
      </section>
    );
  }

  if (!albums.length) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl md:text-4xl font-semibold tracking-tight text-white/90">
            Галерея
          </h2>
          <p className="mt-2 text-center text-white/60">
            Пока нет опубликованных фотографий.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* заголовок + описание по центру */}
        <h2 className="text-center text-3xl md:text-4xl font-semibold tracking-tight text-white/90">
          Галерея
        </h2>
        <p className="mt-2 text-center text-white/70">
          Живые моменты с мастер-классов и событий Dandelion.
        </p>

        {/* список альбомов — также центрируем контент */}
        <div className="mt-10 space-y-12">
          {albums.map((album, idx) => {
            const albumId = album.id ?? idx;

            return (
              <div key={albumId} className="space-y-5">
                {/* заголовок альбома по центру */}
                <div className="text-center">
                  <h3 className="inline-block rounded-2xl px-4 py-1 text-lg md:text-xl font-medium text-white/90 bg-white/5 backdrop-blur">
                    {album.title || `Альбом #${albumId}`}
                  </h3>
                </div>

                {/* СЕТКА ФОТО ПО ЦЕНТРУ */}
                <div
                  ref={(el) => {
                    if (el) scrollersRef.current[albumId] = el;
                  }}
                  className="
                    grid gap-6
                    justify-center              /* центрируем всю сетку */
                    justify-items-center         /* центрируем элементы в колонках */
                    grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                  "
                >
                  {(album.photos || []).map((p, pIdx) => (
                    <button
                      key={p.id ?? pIdx}
                      type="button"
                      onClick={() => open(idx, pIdx)}
                      className="group relative rounded-2xl overflow-hidden bg-white/5 ring-1 ring-white/10 hover:ring-white/20 transition"
                      style={{ width: 360, height: 240 }} // одинаковая ширина — визуально центрируется ровно
                      aria-label="Открыть фото"
                    >
                      <img
                        src={p.url}
                        alt={p.title || ''}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      {p.title ? (
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-2 text-left">
                          <span className="inline-block rounded-lg bg-black/40 text-white/90 text-xs px-2 py-1">
                            {p.title}
                          </span>
                        </div>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Лайтбокс */}
      {lightbox && lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={lightboxSrc} alt="" className="w-full h-auto rounded-2xl" />
            <button
              type="button"
              onClick={close}
              className="absolute top-2 right-2 rounded-full bg-white/10 hover:bg-white/20 text-white p-2"
              aria-label="Закрыть"
            >
              ✕
            </button>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 text-white p-2"
              aria-label="Предыдущее"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 text-white p-2"
              aria-label="Следующее"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
