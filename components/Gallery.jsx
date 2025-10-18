"use client";

import { useEffect, useState } from "react";

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [visible, setVisible] = useState(12);
  const [big, setBig] = useState(null); // { url, w, h }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/gallery", { cache: "no-store" });
        const json = await res.json();
        if (!cancelled) setItems(json.items || []);
      } catch (e) {
        console.error(e);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const showMore = () => setVisible((v) => v + 12);

  return (
    <section id="gallery" className="py-16 scroll-mt-24 lg:scroll-mt-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-center text-[#ECEDE8] text-[28px] md:text-[32px] font-medium tracking-wide mb-8">
          Галерея мастер-классов
        </h2>

        {/* Сетка изображений */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.slice(0, visible).map((it) => (
            <button
              key={it.id}
              className="group relative rounded-xl overflow-hidden bg-black/20"
              onClick={() => setBig(it)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.url}
                alt=""
                className="block w-full h-48 md:h-44 lg:h-40 object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </button>
          ))}
        </div>

        {/* Показать ещё */}
        {visible < items.length && (
          <div className="text-center mt-8">
            <button
              onClick={showMore}
              className="rounded-md bg-[#E7E8E0] text-[#222] px-5 py-2 text-[15px]
                         transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Показать ещё
            </button>
          </div>
        )}

        {/* Пусто */}
        {items.length === 0 && (
          <div className="text-center text-[#ECEDE8]/80">Пока нет фотографий</div>
        )}
      </div>

      {/* Просмотр крупно */}
      {big && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setBig(null)}
        >
          <div
            className="relative max-w-[90vw] max-h-[85vh] rounded-2xl overflow-hidden bg-[#222]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={big.url}
              alt=""
              className="block max-w-[90vw] max-h-[85vh] object-contain"
            />
            <button
              className="absolute top-3 right-3 rounded-md bg-[#3F3F3F] text-[#E7E8E0] px-3 py-1.5 text-sm
                         transition hover:opacity-90"
              onClick={() => setBig(null)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
