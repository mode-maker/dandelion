'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

function cls(...parts) {
  return parts.filter(Boolean).join(' ');
}

export default function AlbumPage({ params }) {
  const albumId = Number(params.id);
  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  async function loadAlbum() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/albums/${albumId}`);
      const data = await res.json();
      setAlbum(data.album || null);
      setPhotos(Array.isArray(data.photos) ? data.photos : []);
    } catch (e) {
      console.error('loadAlbum failed:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlbum();
  }, [albumId]);

  function pickFiles() {
    fileInputRef.current?.click();
  }

  async function onPickFiles(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);

    try {
      // Грузим ПО ОДНОМУ файлу, чтобы не упереться в лимиты тела запроса
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('albumId', String(albumId));

        const res = await fetch(`/api/admin/albums/${albumId}/upload`, {
          method: 'POST',
          body: fd, // ВАЖНО: не ставим Content-Type — браузер проставит boundary сам
        });

        if (!res.ok) {
          // Не пытаемся делать res.json(), если не ok — это как раз уберёт "Unexpected token 'R'"
          const txt = await res.text().catch(() => '');
          console.error('upload failed:', res.status, txt);
          throw new Error(`upload failed: ${res.status}`);
        }

        const data = await res.json();
        if (data?.item) {
          setPhotos((prev) => {
            // небольшая защита от дублей
            if (prev.some((p) => p.id === data.item.id)) return prev;
            return [...prev, data.item].sort((a, b) => (a.sort_index ?? 0) - (b.sort_index ?? 0) || a.id - b.id);
          });
        }
      }
    } catch (e) {
      console.error('onPickFiles error:', e);
      alert('Не удалось загрузить часть файлов. Подробности в консоли.');
    } finally {
      setUploading(false);
      // сбросим инпут, чтобы повторно выбрать те же файлы можно было
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function togglePublish(photoId, next) {
    try {
      const res = await fetch('/api/admin/photos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: photoId, published: next }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error('patch failed');
      setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, published: next } : p)));
    } catch (e) {
      console.error('togglePublish failed:', e);
      alert('Не удалось изменить публикацию.');
    }
  }

  async function removePhoto(photo) {
    if (!confirm('Удалить фото безвозвратно?')) return;
    try {
      const res = await fetch('/api/admin/photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: photo.id, url: photo.url }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error('delete failed');
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } catch (e) {
      console.error('removePhoto failed:', e);
      alert('Не удалось удалить фото.');
    }
  }

  const title = useMemo(() => album?.title || `Альбом #${albumId}`, [albumId, album]);

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden">
      {/* фон */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(20,60,40,.7),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(10,30,25,.9),#0a1613)]" />
      <div className="pointer-events-none absolute inset-0">
        {/* лёгкие частицы/блики */}
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#1f3d31 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-semibold text-xl">
            Альбом: {title}
            {album?.created_at ? (
              <span className="ml-2 text-white/60 text-sm">
                ·{' '}
                {new Date(album.created_at).toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            ) : null}
          </h1>
          <div className="flex gap-2">
            <Link
              href="/admin"
              className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15 transition"
            >
              ← К альбомам
            </Link>
            <button
              onClick={loadAlbum}
              className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15 transition"
            >
              Обновить
            </button>
            <button
              disabled={uploading}
              onClick={pickFiles}
              className={cls(
                'rounded-xl px-4 py-2 transition',
                uploading ? 'bg-emerald-700/50 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-500'
              )}
            >
              {uploading ? 'Загрузка…' : 'Добавить фото'}
            </button>
            <input
              ref={fileInputRef}
              className="hidden"
              type="file"
              multiple
              accept="image/*"
              onChange={onPickFiles}
            />
          </div>
        </div>

        {/* сетка фотографий */}
        {loading ? (
          <div className="rounded-2xl bg-white/5 p-6 text-white/70">Загрузка альбома…</div>
        ) : photos.length === 0 ? (
          <div className="rounded-2xl bg-white/5 p-6 text-white/70">
            Здесь пока нет фото. Нажми «Добавить фото».
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos
              .slice()
              .sort((a, b) => (a.sort_index ?? 0) - (b.sort_index ?? 0) || a.id - b.id)
              .map((p) => (
                <div key={p.id} className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                  <div className="aspect-[4/3] bg-black/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt={p.title || `photo ${p.id}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div className="text-sm text-white/80">
                      <div className="font-medium">
                        #{p.id} {p.title ? `· ${p.title}` : ''}
                      </div>
                      <div className="text-xs mt-0.5">
                        {p.published ? 'Публикуется' : 'Скрыто'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => togglePublish(p.id, !p.published)}
                        className={cls(
                          'rounded-lg px-3 py-1.5 text-sm transition',
                          p.published
                            ? 'bg-white/10 hover:bg-white/15'
                            : 'bg-emerald-600 hover:bg-emerald-500'
                        )}
                        title={p.published ? 'Скрыть' : 'Показать'}
                      >
                        {p.published ? 'Скрыть' : 'Показать'}
                      </button>
                      <button
                        onClick={() => removePhoto(p)}
                        className="rounded-lg px-3 py-1.5 text-sm bg-red-600/80 hover:bg-red-600 transition"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
