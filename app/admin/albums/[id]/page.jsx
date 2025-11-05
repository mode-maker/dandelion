'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-20%,#163223_50%,#0b1310_100%)]" />
      <div className="absolute inset-0 mix-blend-screen opacity-30">
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

/** Карточка фото + drag handle */
function PhotoCard({
  p,
  onTogglePublish,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  return (
    <div
      className="group relative rounded-2xl border border-[#2a3a31] bg-white/5 p-2 shadow-[0_6px_25px_rgba(0,0,0,0.25)]"
      draggable
      onDragStart={(e) => onDragStart(e, p)}
      onDragOver={(e) => onDragOver(e, p)}
      onDrop={(e) => onDrop(e, p)}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
        <img
          src={p.url}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
        />
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="min-w-0 text-xs text-gray-300">
          <div className="truncate">
            <span className="text-gray-400">#{p.id}</span> ·{' '}
            <span>{p.published ? 'Публикуется' : 'Скрыто'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTogglePublish(p)}
            className="rounded-lg bg-[#29523d] px-2.5 py-1 text-xs hover:bg-[#2f6148]"
          >
            {p.published ? 'Скрыть' : 'Показать'}
          </button>
          <button
            onClick={() => onDelete(p)}
            className="rounded-lg bg-[#4a1f1f] px-2.5 py-1 text-xs hover:bg-[#5a2626]"
          >
            Удалить
          </button>
        </div>
      </div>

      {/* drag hint */}
      <div className="absolute right-2 top-2 hidden rounded-md bg-black/30 px-2 py-1 text-[10px] opacity-80 group-hover:block">
        Тяни для сортировки
      </div>
    </div>
  );
}

export default function AdminAlbumPage({ params }) {
  const albumId = Number(params.id);
  const [albumMeta, setAlbumMeta] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    const [phRes, alRes] = await Promise.all([
      fetch(`/api/admin/photos?albumId=${albumId}`, { cache: 'no-store' }),
      fetch(`/api/admin/albums`, { cache: 'no-store' }),
    ]);
    const ph = await phRes.json();
    const al = await alRes.json();
    setPhotos(ph.items || []);
    setAlbumMeta((al.items || []).find((a) => a.id === albumId) || null);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumId]);

  const sorted = useMemo(
    () =>
      [...photos].sort(
        (a, b) => (a.sort_index - b.sort_index) || (a.id - b.id),
      ),
    [photos],
  );

  /** Показать/Скрыть */
  async function togglePublish(p) {
    const next = { ...p, published: !p.published };
    setPhotos((prev) => prev.map((x) => (x.id === p.id ? next : x)));
    await fetch('/api/admin/photos', {
      method: 'PATCH',
      body: JSON.stringify({ id: p.id, published: next.published }),
    });
  }

  /** Удалить */
  async function removePhoto(p) {
    if (!confirm('Удалить фотографию?')) return;
    await fetch('/api/admin/photos', {
      method: 'DELETE',
      body: JSON.stringify({ id: p.id, url: p.url }),
    });
    await load();
  }

  /** Drag & Drop без внешних библиотек */
  const dragState = useRef({ from: null, over: null });

  function onDragStart(e, p) {
    dragState.current.from = p;
    e.dataTransfer.effectAllowed = 'move';
    // Safari: должен быть setData
    e.dataTransfer.setData('text/plain', String(p.id));
  }
  function onDragOver(e, p) {
    e.preventDefault();
    dragState.current.over = p;
    e.dataTransfer.dropEffect = 'move';
  }
  async function onDrop(e, p) {
    e.preventDefault();
    const from = dragState.current.from;
    const over = dragState.current.over || p;
    dragState.current = { from: null, over: null };
    if (!from || !over || from.id === over.id) return;

    // локально меняем порядок для мгновенного фидбэка
    setPhotos((prev) => {
      const a = prev.find((x) => x.id === from.id);
      const b = prev.find((x) => x.id === over.id);
      if (!a || !b) return prev;
      const ai = a.sort_index;
      const bi = b.sort_index;
      return prev.map((x) =>
        x.id === a.id ? { ...a, sort_index: bi } : x.id === b.id ? { ...b, sort_index: ai } : x,
      );
    });

    // сохраняем два патча
    await Promise.all([
      fetch('/api/admin/photos', {
        method: 'PATCH',
        body: JSON.stringify({ id: from.id, sort_index: over.sort_index }),
      }),
      fetch('/api/admin/photos', {
        method: 'PATCH',
        body: JSON.stringify({ id: over.id, sort_index: from.sort_index }),
      }),
    ]);

    // добираем из API, чтобы порядок был идеальным
    await load();
  }

  /** Добавление фото (множественное) */
  async function doUpload(files) {
    const list = Array.from(files || []);
    if (!list.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      list.forEach((f) => fd.append('files', f));
      const r = await fetch(`/api/admin/albums/${albumId}/upload`, {
        method: 'POST',
        body: fd,
      });
      const j = await r.json();
      if (j.error) alert(j.error);
      await load();
      if (fileRef.current) fileRef.current.value = '';
    } finally {
      setUploading(false);
    }
  }

  const title = albumMeta?.title || `Альбом #${albumId}`;
  const date = albumMeta?.created_at ? new Date(albumMeta.created_at) : null;
  const humanDate = date
    ? date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className="relative min-h-dvh text-white">
      <BackgroundFX />

      <div className="mx-auto w-full max-w-6xl px-5 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-semibold tracking-tight">
              <span className="text-2xl">Альбом:</span>{' '}
              <span className="text-2xl">{title}</span>{' '}
              <span className="text-sm text-gray-300">· {humanDate}</span>
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin"
              className="rounded-xl bg-white/10 px-4 py-2 text-sm backdrop-blur hover:bg-white/15"
            >
              ← К альбомам
            </Link>
            <button
              onClick={load}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm backdrop-blur hover:bg-white/15"
            >
              Обновить
            </button>

            <label className="cursor-pointer rounded-xl bg-[#2c5b43] px-4 py-2 text-sm hover:bg-[#376e54]">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => doUpload(e.target.files)}
              />
              {uploading ? 'Загрузка…' : 'Добавить фото'}
            </label>
          </div>
        </div>

        {loading ? (
          <div className="opacity-70">Загрузка…</div>
        ) : (
          <>
            {/* сетка 3×N (адаптив) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((p) => (
                <PhotoCard
                  key={p.id}
                  p={p}
                  onTogglePublish={togglePublish}
                  onDelete={removePhoto}
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                />
              ))}
            </div>

            {!sorted.length && (
              <div className="mt-8 rounded-2xl border border-[#2a3a31] bg-white/5 p-6 text-center text-sm text-gray-400">
                Здесь пока нет фото. Нажми «Добавить фото».
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
