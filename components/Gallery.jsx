// components/Gallery.jsx
'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Image from 'next/image';

// форматируем дату: 31 октября 2025
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

// маленький помощник для fetch JSON
async function getJSON(url) {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

// хук наблюдения за видимостью элемента
function useOnScreen(ref, rootMargin = '200px') {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting || entry.intersectionRatio > 0),
      { root: null, rootMargin, threshold: 0.01 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return visible;
}

export default function Gallery() {
  const [albums, setAlbums] = useState([]); // [{id,title,cover_url,photo_count,event_date}]
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // lightbox
  const [lightbox, setLightbox] = useState(null); // {albumIdx, idx, url}
  const open = useCallback((albumIdx, idx, url) => {
    setLightbox({ albumIdx, idx, url });
  }, []);
  const close = useCallback(() => setLightbox(null), []);
  const next = useCallback(() => {
    if (!lightbox) return;
    const a = albums[lightbox.albumIdx];
    const len = a._photos?.length || 0;
    if (!len) return;
    const n = (lightbox.idx + 1) % len;
    setLightbox({ albumIdx: lightbox.albumIdx, idx: n, url: a._photos[n].url });
  }, [lightbox, albums]);
  const prev = useCallback(() => {
    if (!lightbox) return;
    const a = albums[lightbox.albumIdx];
    const len = a._photos?.length || 0;
    if (!len) return;
    const n = (lightbox.idx - 1 + len) % len;
    setLightbox({ albumIdx: lightbox.albumIdx, idx: n, url: a._photos[n].url });
  }, [lightbox, albums]);

  // загрузка альбомов (метаданные)
  useEffect(() => {
    (async () => {
      try {
        const data = await getJSON('/api/albums'); // теперь без фото
        setAlbums(data.map(a => ({ ...a, _photos: [], _loaded: false })));
      } catch (e) {
        setError(e?.message || 'Не удалось загрузить альбомы');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <section className="w-full py-10 md:py-14 flex justify-center">
        <div className="w-full max-w-6xl px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Галерея</h2>
          <p className="mt-2 opacity-70">Загрузка альбомов…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full py-10 md:py-14 flex justify-center">
        <div className="w-full max-w-6xl px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Галерея</h2>
          <p className="mt-2 text-red-300">Ошибка: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-10 md:py-14 flex justify-center">
      <div className="w-full max-w-6xl px-4 md:px-8">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Галерея</h2>
          <p className="mt-2 text-[#E7E8E0]/70">Живые моменты с мастер-классов и событий Dandelion.</p>
        </div>
        <div className="space-y-8">
          {albums.map((a, ai) => (
            <AlbumStrip
              key={a.id}
              album={a}
              albumIndex={ai}
              onPhotosLoaded={(photos) => {
                setAlbums(prev => {
                  const copy = [...prev];
                  copy[ai] = { ...copy[ai], _photos: photos, _loaded: true };
                  return copy;
                });
              }}
              onOpen={(idx, url) => open(ai, idx, url)}
            />
          ))}
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center" onClick={close}>
          <button
            className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-white/10 ring-1 ring-white/10 text-white"
            onClick={(e)=>{e.stopPropagation();close();}}
          >
            Закрыть
          </button>
          <button
            className="absolute left-4 md:left-8 px-3 py-1.5 rounded-lg bg-white/10 ring-1 ring-white/10 text-white"
            onClick={(e)=>{e.stopPropagation();prev();}}
            aria-label="Предыдущее фото"
          >
            ←
          </button>
          {/* большое изображение в лайтбоксе */}
          <Image
            src={lightbox.url}
            alt=""
            width={1600}
            height={900}
            sizes="(max-width: 768px) 90vw, 80vw"
            className="rounded-xl ring-1 ring-white/10 shadow-2xl max-w-[90vw] max-h-[90vh] object-contain"
            priority
            unoptimized={false}
          />
          <button
            className="absolute right-4 md:right-8 px-3 py-1.5 rounded-lg bg-white/10 ring-1 ring-white/10 text-white"
            onClick={(e)=>{e.stopPropagation();next();}}
            aria-label="Следующее фото"
          >
            →
          </button>
        </div>
      )}
    </section>
  );
}

// Одна горизонтальная лента альбома
function AlbumStrip({ album, albumIndex, onPhotosLoaded, onOpen }) {
  const stripRef = useRef(null);
  const headerRef = useRef(null);
  const visible = useOnScreen(headerRef, '300px'); // как только заголовок альбома виден — грузим фото
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(album.photo_count || 0);
  const [photos, setPhotos] = useState(album._photos || []);
  const loadingRef = useRef(false);

  const LIMIT = 28; // шаг подгрузки фото

  // Подгрузка фото порциями
  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    if (total && photos.length >= total) return;
    loadingRef.current = true;
    try {
      const offset = page * LIMIT;
      const data = await getJSON(`/api/albums/${album.id}/photos?limit=${LIMIT}&offset=${offset}`);
      setPhotos(prev => [...prev, ...data.items]);
      setTotal(data.total || total);
      setPage(p => p + 1);
      if (onPhotosLoaded && !album._loaded && offset === 0) onPhotosLoaded(data.items);
    } catch {
      // тихо игнорим, чтобы не мешать UX
    } finally {
      loadingRef.current = false;
    }
  }, [album.id, page, LIMIT, total, photos.length, album._loaded, onPhotosLoaded]);

  // как только лента попала в экран — грузим первую порцию
  useEffect(() => {
    if (visible && photos.length === 0) {
      loadMore();
    }
  }, [visible, photos.length, loadMore]);

  // Виртуализация: считаем какие миниатюры видимы
  const [range, setRange] = useState({ start: 0, end: 0 });
  const ITEM_W = 320; // базовая ширина «карточки» (min-w)
  const GAP = 16;

  const onScroll = useCallback(() => {
    const el = stripRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const vw = el.clientWidth;
    const perItem = ITEM_W + GAP;
    const start = Math.max(0, Math.floor(scrollLeft / perItem) - 3);
    const visibleCount = Math.ceil(vw / perItem) + 6; // буфер с обеих сторон
    const end = Math.min(photos.length, start + visibleCount);
    setRange({ start, end });

    // догружаем следующую порцию ближе к концу
    if (end > photos.length - 8) {
      loadMore();
    }
  }, [photos.length, loadMore]);

  useEffect(() => {
    onScroll(); // рассчитать изначально
  }, [photos.length]); // eslint-disable-line

  const slice = useMemo(() => photos.slice(range.start, range.end), [photos, range]);

  return (
    <div className="content-auto">
      {/* Заголовок альбома */}
      <div ref={headerRef} className="px-4 md:px-8 flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <h3 className="text-xl md:text-2xl font-semibold tracking-tight">{album.title}</h3>
          {album.event_date ? <span className="text-sm opacity-60">{formatRuDate(album.event_date)}</span> : null}
          {typeof album.photo_count === 'number' ? (
            <span className="text-sm opacity-60">· {album.photo_count} фото</span>
          ) : null}
        </div>
      </div>

      {/* Горизонтальная лента с виртуализацией */}
      <div className="px-4 pb-4">
        <div
          ref={stripRef}
          className="no-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory"
          onScroll={onScroll}
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {/* Спейсер слева */}
          <div style={{ width: (ITEM_W + GAP) * range.start, flex: '0 0 auto' }} />

          {slice.map((p, i) => {
            const idx = range.start + i;
            const w = p.width || 1600;
            const h = p.height || 900;
            return (
              <figure
                key={p.id ?? `${album.id}-${idx}`}
                className="min-w-[320px] md:min-w-[420px] snap-start rounded-2xl overflow-hidden bg-black/10 ring-1 ring-white/5 shadow-md hover:shadow-lg transition-shadow"
              >
                <button
                  onClick={() => onOpen(idx, p.url)}
                  className="block w-full h-64 md:h-72"
                  aria-label="Открыть фото"
                >
                  <Image
                    src={p.url}
                    alt=""
                    width={w}
                    height={h}
                    sizes="(max-width: 768px) 320px, 420px"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    unoptimized={false}
                    quality={70}
                  />
                </button>
              </figure>
            );
          })}

          {/* Спейсер справа */}
          <div style={{ width: Math.max(0, (ITEM_W + GAP) * (photos.length - range.end)), flex: '0 0 auto' }} />
        </div>
      </div>
    </div>
  );
}
