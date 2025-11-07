'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/** Лёгкий фон с «частицами» под зелёную тему Dandelion */
function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-20%,#163223_50%,#0b1310_100%)]" />
      <div className="absolute inset-0 mix-blend-screen opacity-30">
        {/* «пыльца» */}
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-[2px]"
            style={{
              left: `${(i * 137) % 100}%`,
              top: `${(i * 73) % 100}%`,
              width: 6,
              height: 6,
              background: 'rgba(140, 206, 150, 0.45)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function AlbumCard({ album, onDelete, onRename }) {
  const date = album?.created_at ? new Date(album.created_at) : null;
  const humanDate = date
    ? date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className="rounded-2xl border border-[#2a3a31] bg-white/5 backdrop-blur p-4 flex flex-col gap-3 shadow-[0_6px_25px_rgba(0,0,0,0.25)]">
      {/* мини-превью (если есть) */}
      {Array.isArray(album.preview) && album.preview.length > 0 ? (
        <div className="grid grid-cols-4 gap-1">
          {album.preview.slice(0, 8).map((p) => (
            <div key={p.id} className="relative w-full pt-[75%] overflow-hidden rounded-xl">
              <img src={p.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#2a3a31] py-10 text-center text-sm text-gray-400">
          Нет превью
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="truncate font-semibold">{album.title || `Альбом #${album.id}`}</div>
          <div className="text-xs text-gray-400">
            {humanDate} • Фото: {album.photo_count ?? 0}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
                    <button
            onClick={() => onRename(album)}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-sm backdrop-blur hover:bg-white/15"
          >
            Переименовать
          </button>
          <Link
            href={`/admin/albums/${album.id}`}
            className="rounded-lg bg-[#29523d] px-3 py-1.5 text-sm hover:bg-[#2f6148]"
          >
            Открыть
          </Link>
          <button
            onClick={() => onDelete(album.id)}
            className="rounded-lg bg-[#4a1f1f] px-3 py-1.5 text-sm hover:bg-[#5a2626]"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminAlbumsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await fetch('/api/admin/albums', { cache: 'no-store' });
    const j = await r.json();
    setItems(j.items || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createAlbum() {
    const title = prompt('Название альбома');
    if (!title) return;
    await fetch('/api/admin/albums', { method: 'POST', body: JSON.stringify({ title }) });
    await load();
  }

  async function deleteAlbum(id) {
    if (!confirm('Удалить альбом и все фото?')) return;
    await fetch('/api/admin/albums', { method: 'DELETE', body: JSON.stringify({ id }) });
    await load();
  }

  return (
    <div className="relative min-h-dvh text-white">
      <BackgroundFX />

      <div className="mx-auto w-full max-w-6xl px-5 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-semibold tracking-tight">
            <span className="text-sm opacity-70">Админ · </span>
            <span className="text-2xl">Альбомы</span>
          </h1>

          <div className="flex gap-2">
            <button
              onClick={load}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm backdrop-blur hover:bg-white/15"
            >
              Обновить
            </button>
            <button
              onClick={createAlbum}
              className="rounded-xl bg-[#2c5b43] px-4 py-2 text-sm hover:bg-[#376e54]"
            >
              Создать альбом
            </button>
          </div>
        </div>

        {loading ? (
          <div className="opacity-70">Загрузка…</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((a) => (
              <AlbumCard key={a.id} album={a} onDelete={deleteAlbum} />
            ))}
            {!items.length && (
              <div className="rounded-2xl border border-[#2a3a31] bg-white/5 p-6 text-center text-sm text-gray-400">
                Альбомов пока нет. Нажми «Создать альбом».
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
