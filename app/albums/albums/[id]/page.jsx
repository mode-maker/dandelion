// app/albums/[id]/page.jsx
'use client';

import { useEffect, useState } from 'react';

export default function AlbumPage({ params }) {
  const albumId = Number(params.id);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    fetch(`/api/albums/${albumId}/photos`, { cache:'no-store' })
      .then(r=>r.json())
      .then(d => setPhotos(Array.isArray(d) ? d : []));
  }, [albumId]);

  return (
    <section className="w-full py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl md:text-3xl font-semibold text-[#E7E8E0]">Альбом</h2>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
          {photos.map((p) => (
            <figure key={p.id} className="w-full max-w-[520px] rounded-2xl overflow-hidden bg-black/10 shadow-lg shadow-black/20 ring-1 ring-white/5">
              <img src={p.url} alt="" className="w-full h-64 object-cover" loading="lazy" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
