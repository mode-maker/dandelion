// components/Gallery.jsx
'use client';

import { useEffect, useRef, useState } from 'react';

// форматируем дату красиво: 31 октября 2025
function formatRuDate(input) {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(+d)) return '';
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export default function Gallery() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState(null); // { albumIdx, idx, url }

  // refs для горизонтальных лент
  const stripRefs = useRef([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/albums', { cache: 'no-store' });
        const data = await res.json().catch(() => []);
        if (!Array.isArray(data)) throw new Error('Bad albums payload');
        setAlbums(data);
      } catch (e) {
        setError(e?.message || 'Не удалось загрузить альбомы');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // управление лайтбоксом + навигация клавиатурой
  useEffect(() => {
    function onKey(e) {
      if (!lightbox) return;
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  const open = (albumIdx, idx) => {
    const url = albums[albumIdx]?.photos?.[idx]?.url;
    if (url) setLightbox({ albumIdx, idx, url });
  };
  const close = () => setLightbox(null);
  const next = () => {
    const a = albums[lightbox.albumIdx];
    const n = (lightbox.idx + 1) % (a.photos.length || 1);
    setLightbox({ albumIdx: lightbox.albumIdx, idx: n, url: a.photos[n].url });
  };
  const prev = () => {
    const a = albums[lightbox.albumIdx];
    const n = (lightbox.idx - 1 + (a.photos.length || 1)) % (a.photos.length || 1);
    setLightbox({ albumIdx: lightbox.albumIdx, idx: n, url: a.photos[n].url });
  };

  // прокрутка ленты стрелками
  const scrollBy = (ai, dir = 1) => {
    const el = stripRefs.current[ai];
    if (!el) return;
    const step = Math.round(el.clientWidth * 0.85);
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  // для тач-свайпа (мобилка)
  const touchStartX = useRef(0);
  const onTouchStart = (e) => (touchStartX.current = e.touches?.[0]?.clientX || 0);
  const onTouchEnd = (ai, e) => {
    const endX = e.changedTouches?.[0]?.clientX || 0;
    const dx = endX - touchStartX.current;
    if (Math.abs(dx) < 40) return; // маленькое движение игнорируем
    scrollBy(ai, dx > 0 ? -1 : 1);
  };

  // загрузка одного файла (кнопка только в лайтах)
  async function downloadPhoto(url, filename = 'photo.jpg') {
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch {
      alert('Не удалось скачать файл.');
    }
  }

  return (
    <section className="w-full py-10 md:py-14">
      {/* классы для скрытия скроллбара */}
      <style jsx global>{`
        .no-scrollbar {
          -ms-overflow-style: none; /* IE/Edge */
          scrollbar-width: none;    /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar { display: none; } /* Chrome/Safari */
      `}</style>

      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl md:text-3xl font-semibold text-[#E7E8E0]">
          Галерея
        </h2>

        {loading && <p className="mt-6 text-center text-[#E7E8E0]/70">Загружаем альбомы…</p>}
        {!loading && error && <p className="mt-6 text-center text-red-300">{error}</p>}
        {!loading && !error && albums.length === 0 && (
          <p className="mt-6 text-center text-[#E7E8E0]/70">Пока нет альбомов.</p>
        )}

        <div className="mt-8 space-y-10">
          {albums.map((a, ai) => (
            <div
              key={a.id}
              className="relative rounded-2xl bg-black/10 ring-1 ring-white/5 shadow-lg shadow-black/20 overflow-hidden"
            >
              {/* заголовок альбома */}
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

                <div className="hidden md:flex gap-2">
                  {/* стрелки пролистывания (desktop) */}
                  <button
                    onClick={() => scrollBy(ai, -1)}
                    className="h-9 w-9 grid place-items-center rounded-xl bg-white/10 ring-1 ring-white/10 text-[#E7E8E0] hover:bg-white/15"
                    aria-label="Назад"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => scrollBy(ai, 1)}
                    className="h-9 w-9 grid place-items-center rounded-xl bg-white/10 ring-1 ring-white/10 text-[#E7E8E0] hover:bg-white/15"
                    aria-label="Вперёд"
                  >
                    →
                  </button>
                </div>
              </div>



              {/* горизонтальная лента */}
              <div className="px-4 pb-4">
                <div
                  ref={(el) => (stripRefs.current[ai] = el)}
                  className="no-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory"
                  onTouchStart={onTouchStart}
                  onTouchEnd={(e) => onTouchEnd(ai, e)}
                >
                  {a.photos.map((p, pi) => (
                    <figure
                      key={p.id}
                      className="min-w-[300px] md:min-w-[420px] snap-start rounded-2xl overflow-hidden bg-black/10 ring-1 ring-white/5 shadow-md hover:shadow-lg transition-shadow"
                    >
                      <img
                        src={p.url}
                        alt=""
                        className="w-full h-64 object-cover cursor-zoom-in"
                        onClick={() => open(ai, pi)}
                        loading="lazy"
                      />
                    </figure>
                  ))}
                  {a.photos.length === 0 && (
                    <div className="text-[#E7E8E0]/70 px-2 py-4">В этом альбоме пока нет фото.</div>
                  )}
                </div>
              </div>

              {/* кнопки-стрелки поверх ленты (mobile + desktop) */}
              <button
                onClick={() => scrollBy(ai, -1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center rounded-full bg-black/40 backdrop-blur ring-1 ring-white/10 text-white hover:bg-black/55"
                aria-label="Назад"
              >
                ←
              </button>
              <button
                onClick={() => scrollBy(ai, 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center rounded-full bg-black/40 backdrop-blur ring-1 ring-white/10 text-white hover:bg-black/55"
                aria-label="Вперёд"
              >
                →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Лайтбокс (именно здесь появляется «Скачать») */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          onClick={close}
        >
          <div
            className="absolute top-4 right-4 flex gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() =>
                downloadPhoto(
                  lightbox.url,
                  `photo_${albums[lightbox.albumIdx]?.photos?.[lightbox.idx]?.id || ''}.jpg`,
                )
              }
              className="px-3 py-1.5 rounded-lg bg-white/10 ring-1 ring-white/10 text-white hover:bg-white/15"
              title="Скачать фото"
            >
              Скачать
            </button>
            <button
              onClick={close}
              className="px-3 py-1.5 rounded-lg bg-white/10 ring-1 ring-white/10 text-white hover:bg-white/15"
              title="Закрыть"
            >
              Закрыть
            </button>
          </div>

          <button
            className="absolute left-4 md:left-8 px-3 py-1.5 rounded-lg bg-white/10 ring-1 ring-white/10 text-white"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Предыдущее фото"
          >
            ←
          </button>

          <img
            src={lightbox.url}
            alt=""
            className="max-h-[90vh] max-w-[90vw] rounded-xl ring-1 ring-white/10 shadow-2xl"
          />

          <button
            className="absolute right-4 md:right-8 px-3 py-1.5 rounded-lg bg-white/10 ring-1 ring-white/10 text-white"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Следующее фото"
          >
            →
          </button>
        </div>
      )}
    </section>
  );
}
