// app/albums/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AlbumsPage() {
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    fetch('/api/albums', { cache:'no-store' })
      .then(r=>r.json())
      .then(d => setAlbums(Array.isArray(d) ? d : []));
  }, []);

  return (
    <section className="w-full py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl md:text-3xl font-semibold text-[#E7E8E0]">Альбомы</h2>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map(a => (
            <Link key={a.id} href={`/albums/${a.id}`} className="rounded-2xl overflow-hidden bg-black/10 shadow-lg shadow-black/20 ring-1 ring-white/5">
              <img src={a.cover_url || '/og-image.jpg'} alt={a.title} className="w-full h-56 object-cover" />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[#E7E8E0] font-medium">{a.title}</h3>
                  <span className="text-[#E7E8E0]/70 text-sm">{a.event_date || '—'}</span>
                </div>
                <div className="text-[#E7E8E0]/70 text-sm mt-1">{a.count} фото</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
