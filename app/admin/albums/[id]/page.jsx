'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function cx(...cls) {
  return cls.filter(Boolean).join(' ');
}

export default function AlbumPage({ params }) {
  const albumId = Number(params?.id);
  const router = useRouter();

  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // DnD refs
  const dragIndex = useRef(null);
  const overIndex = useRef(null);

  const title = useMemo(() => {
    if (!album) return `Альбом #${albumId}`;
    const dt = album.created_at
      ? new Date(album.created_at)
      : null;
    const dateText = dt
      ? dt.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
      : '';
    return `Альбом: ${album.title || `#${album.id}`} · ${dateText}`;
  }, [album, albumId]);

  async function loadAll() {
    try {
      setLoading(true);
      setError('');
      // альбом
      const a = await fetch(`/api/admin/albums?id=${albumId}`, { cache: 'no-store' });
      if (!a.ok) throw new Error(`albums ${a.status}`);
      const albumData = await a.json();
      setAlbum(albumData?.items?.[0] || { id: albumId, title: `#${albumId}` });

      // фото
      const p = await fetch(`/api/admin/photos?albumId=${albumId}&limit=1000&offset=0`, { cache: 'no-store' });
      if (!p.ok) throw new Error(`photos ${p.status}`);
      const photoData = await p.json();
      setPhotos(photoData?.items || []);
    } catch (e) {
      setError(e?.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumId]);

  function onPick() {
    inputRef.current?.click();
  }

  async function onFilesSelected(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setBusy(true);
    setError('');
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('albumId', String(albumId));

        const res = await fetch(`/api/admin/albums/${albumId}/upload`, {
          method: 'POST',
          body: fd,
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(`upload failed: ${res.status} ${txt}`);
        }
        const { item } = await res.json();
        // оптимистично добавляем в конец
        setPhotos((prev) => [...prev, item]);
      }
    } catch (e) {
      console.error(e);
      setError(e?.message || 'Не удалось загрузить файл(ы)');
    } finally {
      setBusy(false);
      // очистим input, чтобы повторно выбрать те же файлы
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function togglePublish(photo) {
    try {
      setBusy(true);
      const res = await fetch('/api/admin/photos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: photo.id, published: !photo.published }),
      });
      if (!res.ok) throw new Error(`PATCH ${res.status}`);
      setPhotos((arr) =>
        arr.map((p) => (p.id === photo.id ? { ...p, published: !p.published } : p)),
      );
    } catch (e) {
      setError(e?.message || 'Ошибка при смене статуса');
    } finally {
      setBusy(false);
    }
  }

  async function removePhoto(photo) {
    if (!confirm('Удалить фото?')) return;
    try {
      setBusy(true);
      const res = await fetch('/api/admin/photos', {
        method: 'DELETE',
        body: JSON.stringify({ id: photo.id, url: photo.url }),
      });
      if (!res.ok) throw new Error(`DELETE ${res.status}`);
      setPhotos((arr) => arr.filter((p) => p.id !== photo.id));
    } catch (e) {
      setError(e?.message || 'Ошибка удаления');
    } finally {
      setBusy(false);
    }
  }

  // --- Drag & Drop сортировка (нативный HTML5) ---
  function onDragStart(idx) {
    dragIndex.current = idx;
  }
  function onDragEnter(idx) {
    overIndex.current = idx;
  }
  function onDragEnd() {
    const from = dragIndex.current;
    const to = overIndex.current;
    dragIndex.current = null;
    overIndex.current = null;
    if (from == null || to == null || from === to) return;
    setPhotos((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      // оптимистично назначим новые sort_index по порядку
      return next.map((p, i) => ({ ...p, sort_index: i }));
    });
    // отложенно отправим на сервер
    saveOrderDebounced();
  }

  const saveOrderDebounced = useMemo(() => {
    let t = null;
    return () => {
      clearTimeout(t);
      t = setTimeout(saveOrder, 400);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos]);

  async function saveOrder() {
    // отправляем PATCH по каждой изменённой записи (просто и надёжно)
    try {
      const updates = photos.map((p, i) =>
        fetch('/api/admin/photos', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: p.id, sort_index: i }),
        }),
      );
      await Promise.all(updates);
    } catch (e) {
      console.error('saveOrder error', e);
      setError('Не удалось сохранить порядок — обнови страницу');
    }
  }

  const grid =
    'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#0b2b24] via-[#0d3a31] to-[#0a1916] text-white">
      {/* мелкие частицы */}
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          {busy && (
            <span className="text-xs text-emerald-300/80">
              · выполняется…
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Link
            href="/admin"
            className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 transition"
          >
            ← К альбомам
          </Link>
          <button
            onClick={() => loadAll()}
            className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 transition"
          >
            Обновить
          </button>

          <button
            onClick={onPick}
            className="ml-auto rounded-xl bg-emerald-500/90 hover:bg-emerald-500 px-4 py-2 transition shadow-lg shadow-emerald-900/30"
            disabled={busy}
          >
            Добавить фото
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onFilesSelected}
          />
        </div>

        {error && (
          <div className="mb-4 rounded-2xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-white/5 px-5 py-6 text-sm text-white/70">
            Загружаем альбом…
          </div>
        ) : photos.length === 0 ? (
          <div className="rounded-2xl bg-white/5 px-5 py-6 text-sm text-white/70">
            Здесь пока нет фото. Нажми «Добавить фото».
          </div>
        ) : (
          <div className={grid}>
            {photos.map((p, idx) => (
              <div
                key={p.id}
                className={cx(
                  'group rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur',
                  'ring-0 focus-within:ring-2 focus-within:ring-emerald-400/60 transition'
                )}
                draggable
                onDragStart={() => onDragStart(idx)}
                onDragEnter={() => onDragEnter(idx)}
                onDragEnd={onDragEnd}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={`photo ${p.id}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    draggable={false}
                  />
                </div>

                <div className="flex items-center justify-between px-3 py-3">
                  <div className="text-xs text-white/70">
                    <div className="font-medium text-white/90">
                      #{p.id}{' '}
                      <span className="text-white/50">· порядок {p.sort_index ?? idx}</span>
                    </div>
                    <div className="mt-0.5">
                      {p.published ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2 py-0.5 text-emerald-300">
                          Публикуется
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-0.5 text-white/70">
                          Скрыто
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePublish(p)}
                      className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm"
                      disabled={busy}
                      title={p.published ? 'Скрыть' : 'Показать'}
                    >
                      {p.published ? 'Скрыть' : 'Показать'}
                    </button>
                    <button
                      onClick={() => removePhoto(p)}
                      className="rounded-lg bg-red-500/20 hover:bg-red-500/30 px-3 py-1.5 text-sm text-red-200"
                      disabled={busy}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="h-16" />
      </div>
    </div>
  );
}
