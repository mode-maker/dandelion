// components/AlbumStrips.jsx
'use client';

import { useEffect, useState } from 'react';

function DownloadIcon(props){return(
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden {...props}>
    <path fill="currentColor" d="M5 20h14v-2H5v2zm7-18l-5.5 5.5 1.41 1.41L11 7.83V16h2V7.83l3.09 3.09 1.41-1.41L12 2z"/>
  </svg>
)}

export default function AlbumStrips(){
  const [albums, setAlbums] = useState([]);
  const [lightbox, setLightbox] = useState(null); // {url, idx, albumIdx}

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/albums', { cache: 'no-store' });
      const data = await res.json().catch(()=>[]);
      setAlbums(Array.isArray(data) ? data : []);
    })();
  }, []);

  async function downloadPhoto(url, filename='photo.jpg'){
    try{
      const resp = await fetch(url);
      const blob = await resp.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    }catch(e){
      alert('Не удалось скачать файл.');
    }
  }

  async function downloadAlbumZip(album){
    for (let i = 0; i < album.photos.length; i++){
      const p = album.photos[i];
      const name = `${album.title || 'album'}_${String(i+1).padStart(2,'0')}.jpg`;
      await downloadPhoto(p.url, name);
    }
  }

  const open = (albumIdx, idx) => {
    const url = albums[albumIdx]?.photos?.[idx]?.url;
    if (url) setLightbox({ url, idx, albumIdx });
  };
  const close = () => setLightbox(null);
  const next = () => {
    if (!lightbox) return;
    const album = albums[lightbox.albumIdx];
    const n = (lightbox.idx + 1) % (album.photos.length || 1);
    setLightbox({ ...lightbox, idx: n, url: album.photos[n].url });
  };
  const prev = () => {
    if (!lightbox) return;
    const album = albums[lightbox.albumIdx];
    const n = (lightbox.idx - 1 + (album.photos.length || 1)) % (album.photos.length || 1);
    setLightbox({ ...lightbox, idx: n, url: album.photos[n].url });
  };

  return (
    <section className="w-full py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl md:text-3xl font-semibold text-[#E7E8E0]">Галерея</h2>

        <div className="mt-8 space-y-10">
          {albums.map((a, ai) => (
            <div key={a.id} className="rounded-2xl bg-black/10 ring-1 ring-white/5 shadow-lg shadow-black/20">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="text-[#E7E8E0]">
                  <div className="text-base md:text-lg font-medium">{a.title || `Альбом #${a.id}`}</div>
                  <div className="text-xs md:text-sm text-[#E7E8E0]/70">{a.event_date || ''}</div>
                </div>
                <button
                  onClick={() => downloadAlbumZip(a)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 ring-1 ring-white/10 text-[#E7E8E0] text-sm hover:bg-white/15"
                  title="Скачать весь альбом"
                >
                  <DownloadIcon/> Скачать альбом
                </button>
              </div>

              <div className="px-4 pb-4">
                <div
                  className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-thin"
                  onWheel={(event) => {
                    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
                    event.preventDefault();
                    event.currentTarget.scrollBy({ left: event.deltaY, behavior: 'auto' });
                  }}
                >
                  {a.photos.map((p, pi) => (
                    <figure
                      key={p.id}
                      className="min-w-[320px] md:min-w-[420px] snap-start rounded-2xl overflow-hidden bg-black/10 ring-1 ring-white/5 shadow-md hover:shadow-lg transition-shadow"
                    >
                      <img
                        src={p.url}
                        alt=""
                        className="w-full h-64 object-cover cursor-zoom-in"
                        onClick={() => open(ai, pi)}
                        loading="lazy"
                      />
                      <figcaption className="px-3 py-2 flex items-center justify-end">
                        <button
                          onClick={() => downloadPhoto(p.url, `photo_${p.id}.jpg`)}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/10 ring-1 ring-white/10 text-[#E7E8E0] hover:bg-white/15"
                          title="Скачать фото"
                        >
                          <DownloadIcon/> Скачать
                        </button>
                      </figcaption>
                    </figure>
                  ))}
                  {a.photos.length === 0 && (
                    <div className="text-[#E7E8E0]/70 px-2 py-4">Пока нет фото.</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center" onClick={close}>
          <button className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-white/10 ring-1 ring-white/10 text-white" onClick={(e)=>{e.stopPropagation();close();}}>Закрыть</button>
          <button className="absolute left-4 md:left-8 px-3 py-1.5 rounded-lg bg-white/10 ring-1 ring-white/10 text-white" onClick={(e)=>{e.stopPropagation();prev();}}>←</button>
          <img src={lightbox.url} alt="" className="max-h-[90vh] max-w-[90vw] rounded-xl ring-1 ring-white/10 shadow-2xl" />
          <button className="absolute right-4 md:right-8 px-3 py-1.5 rounded-lg bg-white/10 ring-1 ring-white/10 text-white" onClick={(e)=>{e.stopPropagation();next();}}>→</button>
        </div>
      )}
    </section>
  );
}
