'use client';

import { useEffect, useState } from 'react';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch('/api/admin/photos?published=true', { cache: 'no-store' });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('GALLERY LOAD ERROR:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const iv = setInterval(load, 10000); // авто-обновление раз в 10с
    const onFocus = () => load();
    window.addEventListener('visibilitychange', onFocus);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(iv);
      window.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return (
    <section className="w-full py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl md:text-3xl font-semibold text-[#E7E8E0]">Галерея</h2>

        {loading && <p className="mt-6 text-center text-[#E7E8E0]/70">Загружаем фотографии…</p>}
        {!loading && items.length === 0 && <p className="mt-6 text-center text-[#E7E8E0]/70">Пока нет фотографий.</p>}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
          {items.map((p) => (
            <figure key={p.id} className="w-full max-w-[520px] rounded-2xl overflow-hidden bg-black/10 shadow-lg shadow-black/20 ring-1 ring-white/5 transition-shadow hover:shadow-xl">
              <img src={p.url} alt={`gallery-${p.id}`} className="w-full h-64 object-cover" loading="lazy" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
