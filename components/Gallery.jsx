"use client";

import { useEffect, useState } from "react";

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);

  const [lightbox, setLightbox] = useState(null); // { index }

  const load = async (append = false, opts = {}) => {
    setLoading(true);
    const q = new URLSearchParams();
    if (cursor && append) q.set("cursor", cursor);
    if (opts.tag) q.set("tag", opts.tag);

    const res = await fetch(`/api/gallery?${q}`, { cache: "no-store" });
    const json = await res.json();
    setLoading(false);
    if (res.ok) {
      setItems((prev) => append ? [...prev, ...json.items] : json.items);
      setCursor(json.nextCursor);
    } else {
      console.error(json);
    }
  };

  useEffect(() => { load(false); }, []);

  // Лайтбокс навигация
  useEffect(() => {
    const onKey = (e) => {
      if (!lightbox) return;
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox(({ index }) => ({ index: Math.min(index + 1, items.length - 1) }));
      if (e.key === "ArrowLeft") setLightbox(({ index }) => ({ index: Math.max(index - 1, 0) }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, items.length]);

  return (
    <section id="gallery" className="py-16 scroll-mt-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-[#ECEDE8] text-[28px] md:text-[32px] text-center tracking-wide mb-6">
          Галерея с&nbsp;мероприятий
        </h2>

        {/* Masonry через CSS columns */}
        <div
          className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 [column-fill:_balance]"
        >
          {items.map((it, idx) => (
            <figure
              key={it.id}
              className="mb-5 break-inside-avoid rounded-xl overflow-hidden bg-black/5
                         shadow-[0_6px_18px_rgba(0,0,0,0.25)] cursor-zoom-in"
              onClick={() => setLightbox({ index: idx })}
            >
              <img
                src={it.thumb}
                alt=""
                loading="lazy"
                className="w-full h-auto transition-transform duration-300 will-change-transform hover:scale-[1.02]"
              />
            </figure>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          {cursor ? (
            <button
              disabled={loading}
              onClick={() => load(true)}
              className="rounded-md bg-white/10 text-[#ECEDE8] px-4 py-2 text-[14px] border border-white/15
                         hover:-translate-y-0.5 hover:shadow-md transition"
            >
              {loading ? "Загрузка..." : "Показать ещё"}
            </button>
          ) : (
            <div className="text-white/60 text-sm">Все фотографии загружены</div>
          )}
        </div>
      </div>

      {/* Лайтбокс */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={items[lightbox.index].full}
            alt=""
            className="max-w-[95vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {/* Стрелки */}
          <button
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80 text-3xl"
            onClick={(e) => { e.stopPropagation(); setLightbox(({ index }) => ({ index: Math.max(index - 1, 0) })); }}
          >‹</button>
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 text-3xl"
            onClick={(e) => { e.stopPropagation(); setLightbox(({ index }) => ({ index: Math.min(index + 1, items.length - 1) })); }}
          >›</button>
          <button
            className="absolute right-3 top-3 text-white/80 text-2xl"
            onClick={() => setLightbox(null)}
          >✕</button>
        </div>
      )}
    </section>
  );
}
