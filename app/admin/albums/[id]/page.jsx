// app/admin/albums/[id]/page.jsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

function api(path) {
  const base = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/+$/, '');
  return base ? `${base}${path}` : path;
}

export default function AlbumPage({ params }) {
  const albumId = Number(params.id);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(api(`/api/admin/photos?albumId=${albumId}&limit=500&offset=0`), {
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Load failed');
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [albumId]);

  useEffect(() => { load(); }, [load]);

  const sorted = useMemo(() => {
    const list = [...items];
    // стабильная сортировка: сначала sort_index (NULLS LAST), затем created_at, затем id
    return list.sort((a, b) => {
      const ai = a.sort_index ?? 1e9;
      const bi = b.sort_index ?? 1e9;
      if (ai !== bi) return ai - bi;
      const ad = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bd = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (ad !== bd) return ad - bd;
      return a.id - b.id;
    });
  }, [items]);

  const canMoveUp = (idx) => idx > 0;
  const canMoveDown = (idx) => idx < sorted.length - 1;

  async function patchPhoto(update) {
    setSavingId(update.id);
    try {
      const res = await fetch(api('/api/admin/photos'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Save failed');
      await load();
    } catch (e) {
      console.error(e);
      alert(e.message || 'Не удалось сохранить');
    } finally {
      setSavingId(null);
    }
  }

  async function deletePhoto(p) {
    if (!confirm('Удалить фотографию?')) return;
    try {
      const res = await fetch(api('/api/admin/photos'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: p.id, url: p.url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Delete failed');
      await load();
    } catch (e) {
      console.error(e);
      alert(e.message || 'Не удалось удалить');
    }
  }

  async function swapPhotos(currentId, neighborId) {
    const res = await fetch(api('/api/admin/photos/reorder'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentId, neighborId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Reorder failed');
  }

  async function moveUp(id) {
    const idx = sorted.findIndex((p) => p.id === id);
    if (!canMoveUp(idx)) return;
    try {
      await swapPhotos(id, sorted[idx - 1].id);
      await load();
    } catch (e) {
      console.error(e);
      alert(e.message || 'Не удалось изменить порядок');
    }
  }

  async function moveDown(id) {
    const idx = sorted.findIndex((p) => p.id === id);
    if (!canMoveDown(idx)) return;
    try {
      await swapPhotos(id, sorted[idx + 1].id);
      await load();
    } catch (e) {
      console.error(e);
      alert(e.message || 'Не удалось изменить порядок');
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-xl md:text-2xl font-semibold">Альбом #{albumId}</h1>
        <Link href="/admin/gallery" className="text-sm opacity-80 hover:opacity-100 underline">
          ← Назад к галереям
        </Link>
      </div>

      <p className="text-sm opacity-70 mb-4">
        Загрузку новых фото пока оставили на общей странице галереи.{' '}
        <Link href="/admin/gallery" className="underline">Здесь</Link> — редактирование и порядок.
      </p>

      {error ? (
        <div className="text-red-400 mb-4">Ошибка: {error}</div>
      ) : null}

      {loading ? (
        <div className="opacity-70">Загрузка…</div>
      ) : sorted.length === 0 ? (
        <div className="opacity-70">Пусто. Добавьте фото в этом альбоме на странице галереи.</div>
      ) : (
        <div className="space-y-4">
          {sorted.map((p, idx) => (
            <div
              key={p.id}
              className="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-3 py-3 md:px-4 md:py-4 flex items-center gap-3 md:gap-4"
            >
              <img
                src={p.url}
                alt={p.title || ''}
                className="w-24 h-16 md:w-28 md:h-20 object-cover rounded-lg shrink-0"
              />

              <div className="flex-1 min-w-0">
                <input
                  className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/30"
                  placeholder="Название / подпись"
                  defaultValue={p.title || ''}
                  onBlur={(e) => {
                    const title = e.target.value.trim();
                    if (title !== (p.title || '')) patchPhoto({ id: p.id, title });
                  }}
                />

                <div className="mt-2 flex items-center gap-4 text-sm">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="accent-current"
                      defaultChecked={!!p.published}
                      onChange={(e) => patchPhoto({ id: p.id, published: e.target.checked })}
                    />
                    Опубликовано
                  </label>

                  <span className="opacity-70">Порядок {p.sort_index ?? '—'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveUp(p.id)}
                  disabled={!canMoveUp(idx)}
                  className="px-2 py-2 rounded-lg border border-white/10 hover:border-white/30 disabled:opacity-40"
                  title="Вверх"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveDown(p.id)}
                  disabled={!canMoveDown(idx)}
                  className="px-2 py-2 rounded-lg border border-white/10 hover:border-white/30 disabled:opacity-40"
                  title="Вниз"
                >
                  ↓
                </button>

                <button
                  onClick={() => deletePhoto(p)}
                  className="ml-2 px-3 py-2 rounded-lg border border-red-500/40 text-red-300 hover:border-red-400 hover:text-red-200"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {savingId ? (
        <div className="mt-3 text-sm opacity-70">Сохранение…</div>
      ) : null}
    </div>
  );
}
