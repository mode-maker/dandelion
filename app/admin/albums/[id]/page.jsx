'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Палитра Dandelion
const COLORS = {
  green: '#556B5A',
  cream: '#E7E8E0',
};

function cx(...a) {
  return a.filter(Boolean).join(' ');
}

export default function AlbumPage() {
  const router = useRouter();
  const params = useParams();
  const albumId = Number(params?.id);

  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Загружаем мета альбома (если есть эндпоинт /api/admin/albums/[id])
  useEffect(() => {
    let cancelled = false;
    async function loadAlbum() {
      try {
        const res = await fetch(`/api/admin/albums/${albumId}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setAlbum(data?.album || data || null);
        } else {
          // Фолбэк, если эндпоинта нет
          if (!cancelled) setAlbum({ id: albumId, title: `Альбом #${albumId}`, created_at: null });
        }
      } catch {
        if (!cancelled) setAlbum({ id: albumId, title: `Альбом #${albumId}`, created_at: null });
      }
    }
    if (Number.isFinite(albumId)) loadAlbum();
    return () => { cancelled = true; };
  }, [albumId]);

  // Загружаем фото альбома
  async function refreshPhotos() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/albums/${albumId}/photos?ts=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      setPhotos(Array.isArray(data?.items) ? data.items : []);
    } catch (e) {
      console.error('load photos fail', e);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (Number.isFinite(albumId)) refreshPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumId, refreshKey]);

  const dateText = useMemo(() => {
    const dt = album?.created_at ? new Date(album.created_at) : null;
    return dt ? dt.toLocaleDateString('ru-RU') : '—';
  }, [album]);

  // Загрузка файлов
  async function doUpload(files) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const form = new FormData();
      for (const f of files) form.append('files', f);
      const res = await fetch(`/api/admin/albums/${albumId}/photos`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'upload failed');
      await refreshPhotos();
    } catch (e) {
      console.error('Upload failed:', e);
      alert(`Ошибка загрузки: ${e.message || e}`);
    } finally {
      setUploading(false);
    }
  }

  // Показать/Скрыть
  async function togglePublish(photo) {
    try {
      const res = await fetch('/api/admin/photos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: photo.id, published: !photo.published }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'patch failed');
      // локально обновим для мгновенного UI
      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, published: !photo.published } : p));
    } catch (e) {
      console.error('publish toggle failed', e);
      alert(`Не удалось обновить статус: ${e.message || e}`);
    }
  }

  // Удаление
  async function removePhoto(photo) {
    if (!confirm('Удалить это фото?')) return;
    try {
      const res = await fetch('/api/admin/photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: photo.id, url: photo.url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'delete failed');
      setPhotos(prev => prev.filter(p => p.id !== photo.id));
    } catch (e) {
      console.error('delete failed', e);
      alert(`Не удалось удалить: ${e.message || e}`);
    }
  }

  // Кнопки перемещения ⬆️/⬇️ (без drag&drop)
  function localSwap(indexA, indexB) {
    setPhotos(prev => {
      const arr = [...prev];
      const tmp = arr[indexA];
      arr[indexA] = arr[indexB];
      arr[indexB] = tmp;
      // пересчёт sort_index локально
      return arr.map((p, i) => ({ ...p, sort_index: i }));
    });
  }

  async function saveOrder(partialIndexes = null) {
    // Если переданы индексы — отправим только их; иначе — весь порядок
    const list = Array.isArray(partialIndexes)
      ? partialIndexes.map(i => ({ id: photos[i].id, sort_index: i }))
      : photos.map((p, i) => ({ id: p.id, sort_index: i }));

    setSavingOrder(true);
    try {
      const res = await fetch(`/api/admin/albums/${albumId}/photos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: list }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'order save failed');
      // Перечитаем на всякий случай
      await refreshPhotos();
    } catch (e) {
      console.error('save order failed', e);
      alert(`Не удалось сохранить порядок: ${e.message || e}`);
    } finally {
      setSavingOrder(false);
    }
  }

  function moveUp(idx) {
    if (idx <= 0) return;
    localSwap(idx, idx - 1);
    // Сохранить только две изменённые позиции
    saveOrder([idx - 1, idx]);
  }

  function moveDown(idx) {
    if (idx >= photos.length - 1) return;
    localSwap(idx, idx + 1);
    saveOrder([idx, idx + 1]);
  }

  return (
    <div
      className="min-h-screen text-[var(--cream)]"
      style={{
        // Глубокий градиентный фон + лёгкое свечение частиц
        background: `radial-gradient(1200px 600px at 20% -10%, rgba(255,255,255,0.07), transparent 60%),
                     radial-gradient(800px 500px at 80% 10%, rgba(255,255,255,0.06), transparent 60%),
                     linear-gradient(180deg, rgba(34,49,40,1) 0%, rgba(21,31,28,1) 100%)`,
        ['--cream']: COLORS.cream,
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight" style={{ color: COLORS.cream }}>
              Альбом: <span className="opacity-90">{album?.title || `#${albumId}`}</span> · <span className="opacity-70">{dateText}</span>
            </h1>
            <p className="mt-1 text-sm opacity-70">Управление фотографиями в стиле Dandelion</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin')}
              className="rounded-2xl px-4 py-2 text-sm bg-white/10 hover:bg-white/15 transition shadow-sm shadow-black/20"
            >
              ← К альбомам
            </button>
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              className="rounded-2xl px-4 py-2 text-sm bg-white/10 hover:bg-white/15 transition shadow-sm shadow-black/20"
              disabled={loading}
            >
              {loading ? 'Обновляю…' : 'Обновить'}
            </button>

            {/* Upload */}
            <label className={cx(
              "cursor-pointer rounded-2xl px-4 py-2 text-sm transition shadow-sm shadow-black/20",
              uploading ? "bg-[var(--green)]/40" : "bg-[var(--green)] hover:opacity-90"
            )} style={{ ['--green']: COLORS.green }}>
              {uploading ? 'Загрузка…' : 'Добавить фото'}
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = e.currentTarget.files;
                  if (files && files.length) doUpload(files);
                  e.currentTarget.value = '';
                }}
              />
            </label>
          </div>
        </div>

        {/* Панель */}
        <div className="rounded-2xl bg-white/5 shadow-xl shadow-black/20 ring-1 ring-white/10 p-4 md:p-5">
          {/* Мини превью порядка */}
          <div className="mb-4">
            <h2 className="mb-2 text-sm font-medium opacity-80">Мини-превью порядка (как на сайте)</h2>
            <div className="flex overflow-x-auto gap-2 pb-2">
              {photos.map((p) => (
                <div key={p.id} className="shrink-0 w-24 aspect-[4/3] rounded-xl overflow-hidden bg-black/30 ring-1 ring-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={`photo ${p.id}`} className="h-full w-full object-cover" />
                </div>
              ))}
              {!photos.length && <div className="text-sm opacity-60">Пока нет фотографий…</div>}
            </div>
          </div>

          {/* Сетка фото */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 rounded-2xl bg-white/5 animate-pulse" />
              ))
            ) : photos.length ? (
              photos.map((p, idx) => (
                <div
                  key={p.id}
                  className="rounded-2xl overflow-hidden bg-white/5 ring-1 ring-white/10 shadow-lg shadow-black/20 group"
                >
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt={p.title || `photo ${p.id}`}
                      className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                      draggable={false}
                    />
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 to-transparent opacity-70" />
                  </div>

                  <div className="p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs opacity-85">
                      <span>#{p.id}</span>
                      <span className={cx("px-2 py-0.5 rounded-full",
                        p.published ? "bg-emerald-400/20 text-emerald-200 ring-1 ring-emerald-300/30" :
                                      "bg-yellow-400/20 text-yellow-200 ring-1 ring-yellow-300/30"
                      )}>
                        {p.published ? 'Публикуется' : 'Скрыто'}
                      </span>
                    </div>

                    {/* Кнопки управления */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => togglePublish(p)}
                        className="rounded-xl px-3 py-1.5 text-xs bg-white/10 hover:bg-white/15 transition shadow-sm shadow-black/20"
                        title={p.published ? 'Скрыть' : 'Показать'}
                      >
                        {p.published ? 'Скрыть' : 'Показать'}
                      </button>

                      <button
                        onClick={() => removePhoto(p)}
                        className="rounded-xl px-3 py-1.5 text-xs bg-white/10 hover:bg-white/15 transition shadow-sm shadow-black/20"
                      >
                        Удалить
                      </button>

                      <div className="ml-auto flex items-center gap-1">
                        <button
                          onClick={() => moveUp(idx)}
                          className="rounded-xl px-2 py-1.5 text-xs bg-white/10 hover:bg-white/15 transition shadow-sm shadow-black/20 disabled:opacity-40"
                          disabled={idx === 0 || savingOrder}
                          title="Выше"
                        >
                          ⬆️
                        </button>
                        <button
                          onClick={() => moveDown(idx)}
                          className="rounded-xl px-2 py-1.5 text-xs bg-white/10 hover:bg-white/15 transition shadow-sm shadow-black/20 disabled:opacity-40"
                          disabled={idx === photos.length - 1 || savingOrder}
                          title="Ниже"
                        >
                          ⬇️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-sm opacity-70">
                В этом альбоме пока нет фотографий. Нажмите «Добавить фото».
              </div>
            )}
          </div>

          {/* Нижняя панель действий */}
          <div className="mt-5 flex items-center justify-between">
            <div className="text-xs opacity-60">
              Всего: {photos.length} фото
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRefreshKey(k => k + 1)}
                className="rounded-2xl px-4 py-2 text-sm bg-white/10 hover:bg-white/15 transition shadow-sm shadow-black/20"
                disabled={loading}
              >
                {loading ? 'Обновляю…' : 'Обновить'}
              </button>
              <button
                onClick={() => saveOrder()}
                className={cx(
                  "rounded-2xl px-4 py-2 text-sm transition shadow-sm shadow-black/20",
                  savingOrder ? "bg-[var(--green)]/40" : "bg-[var(--green)] hover:opacity-90"
                )}
                style={{ ['--green']: COLORS.green }}
                disabled={savingOrder || loading}
              >
                {savingOrder ? 'Сохраняю порядок…' : 'Сохранить порядок'}
              </button>
            </div>
          </div>
        </div>

        {/* Подсказка по стилю */}
        <p className="mt-4 text-xs opacity-60">
          Стиль: мягкие скругления (rounded-2xl), тени shadow-black/20, полупрозрачные панели bg-white/5, зелёные акценты {COLORS.green}.
        </p>
      </div>
    </div>
  );
}
