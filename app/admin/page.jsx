'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

function fmtDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

async function jsonFetch(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json();
}

export default function AdminAlbumsPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const total = useMemo(() => albums?.length || 0, [albums]);

  async function loadAlbums() {
    setLoading(true);
    setError('');
    try {
      const data = await jsonFetch('/api/admin/albums');
      setAlbums(Array.isArray(data?.items) ? data.items : []);
    } catch (e) {
      console.error('loadAlbums failed:', e);
      setError('Не удалось загрузить альбомы');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlbums();
  }, []);

  async function handleCreate() {
    const name = prompt('Название нового альбома:');
    if (!name || !name.trim()) return;
    setBusy(true);
    setError('');
    try {
      await jsonFetch('/api/admin/albums', {
        method: 'POST',
        body: JSON.stringify({ title: name.trim() }),
      });
      await loadAlbums();
    } catch (e) {
      console.error('create album failed:', e);
      alert('Ошибка создания альбома');
    } finally {
      setBusy(false);
    }
  }

  async function handleRename(album) {
    const name = prompt('Новое название альбома:', album.title || '');
    if (!name || !name.trim()) return;
    setBusy(true);
    setError('');
    try {
      await jsonFetch(`/api/admin/albums/${album.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: name.trim() }),
      });
      await loadAlbums();
    } catch (e) {
      console.error('rename failed:', e);
      alert('Ошибка переименования');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(album) {
    if (!confirm(`Удалить альбом «${album.title || album.id}» вместе со снимками?`)) return;
    setBusy(true);
    setError('');
    try {
      await jsonFetch(`/api/admin/albums/${album.id}`, { method: 'DELETE' });
      await loadAlbums();
    } catch (e) {
      console.error('delete failed:', e);
      alert('Ошибка удаления');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(32,84,72,0.75),transparent),radial-gradient(1000px_800px_at_90%_0%,rgba(24,54,46,0.65),transparent),#0c201a] text-emerald-50">
      {/* мягкие частицы/зерно */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.04),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.03),transparent_40%),radial-gradient(circle_at_60%_80%,rgba(255,255,255,0.025),transparent_45%)]" />

      <div className="relative mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Админ · Альбомы
            {total ? <span className="ml-3 text-emerald-300/70 text-base align-middle">({total})</span> : null}
          </h1>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAlbums}
              disabled={loading || busy}
              className="rounded-xl px-4 py-2 bg-white/5 hover:bg-white/10 transition disabled:opacity-50"
            >
              Обновить
            </button>
            <button
              onClick={handleCreate}
              disabled={busy}
              className="rounded-xl px-4 py-2 bg-emerald-500/90 hover:bg-emerald-400 text-emerald-950 font-semibold transition disabled:opacity-50"
            >
              Создать альбом
            </button>
          </div>
        </header>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
            {error}
          </div>
        ) : null}

        <div className="rounded-3xl border border-emerald-400/10 bg-white/5 backdrop-blur px-4 py-4">
          {loading ? (
            <div className="py-10 text-center text-emerald-200/80">Загрузка…</div>
          ) : albums.length === 0 ? (
            <div className="py-10 text-center text-emerald-200/70">
              Альбомов пока нет. Нажмите «Создать альбом».
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {albums.map((a) => (
                <li key={a.id}>
                  <AlbumCard
                    album={a}
                    onDelete={() => handleDelete(a)}
                    onRename={() => handleRename(a)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function AlbumCard({ album, onDelete, onRename }) {
  const cover = album.cover_url || album.cover || album.preview || '';
  const date = fmtDate(album.created_at || album.createdAt);
  const count = album.photo_count ?? album.photos_count ?? album.count ?? 0;

  return (
    <div className="group rounded-2xl border border-emerald-400/10 bg-emerald-800/10 hover:bg-emerald-700/10 transition overflow-hidden">
      {cover ? (
        <div className="aspect-[16/9] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={album.title || `Альбом #${album.id}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] w-full bg-emerald-900/20 flex items-center justify-center text-emerald-200/60">
          без обложки
        </div>
      )}

      <div className="p-4 flex flex-col gap-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-emerald-50 truncate">
              {album.title || `Альбом #${album.id}`}
            </h3>
            <span className="text-xs text-emerald-200/70 whitespace-nowrap">{date}</span>
          </div>
          <div className="mt-1 text-sm text-emerald-200/70">
            Фото: <b className="text-emerald-200">{count}</b>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/albums/${album.id}`}
            className="inline-flex items-center justify-center rounded-xl px-3 py-2 bg-emerald-500/90 hover:bg-emerald-400 text-emerald-950 font-semibold transition"
          >
            Открыть
          </Link>

          <button
            onClick={onRename}
            className="rounded-xl px-3 py-2 bg-white/5 hover:bg-white/10 transition"
          >
            Переименовать
          </button>

          <button
            onClick={onDelete}
            className="ml-auto rounded-xl px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-100 transition"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
