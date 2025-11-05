'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

function api(path) {
  const base = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/+$/, '');
  return base ? `${base}${path}` : path;
}

export default function AlbumPage({ params }) {
  const albumId = Number(params.id);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [savingId, setSavingId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(api(`/api/admin/photos?albumId=${albumId}&limit=1000&offset=0`), { cache: 'no-store' });
      const j = await r.json();
      setItems(j.items || []);
    } catch (e) {
      console.error('Photos load failed:', e);
      alert('Не удалось загрузить фото: ' + (e?.message || String(e)));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [albumId]);

  async function saveField(id, patch) {
    try {
      setSavingId(id);
      await fetch(api('/api/admin/photos'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...patch }),
      });
      await load();
    } catch (e) {
      alert('Ошибка сохранения: ' + (e?.message || String(e)));
    } finally {
      setSavingId(null);
    }
  }

  async function remove(id, url) {
    if (!confirm('Удалить фото?')) return;
    try {
      setBusyId(id);
      await fetch(api('/api/admin/photos'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, url }),
      });
      await load();
    } catch (e) {
      alert('Ошибка удаления: ' + (e?.message || String(e)));
    } finally {
      setBusyId(null);
    }
  }

  async function move(id, dir) {
    try {
      setBusyId(id);
      await fetch(api('/api/admin/photos/reorder'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, direction: dir }),
      });
      await load();
    } catch (e) {
      alert('Ошибка изменения порядка: ' + (e?.message || String(e)));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Альбом #{albumId}</div>
        <Link href="/admin/galleries" className="text-sm opacity-70 hover:opacity-100 underline">
          ← Назад к галереям
        </Link>
      </div>

      {/* Подсказка о загрузке (временное решение) */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm opacity-80">
        Загрузку новых фото пока оставили на общей странице галереи. Здесь — редактирование и порядок.
      </div>

      {/* Список фото */}
      <div className="rounded-2xl border border-white/10">
        {loading ? (
          <div className="p-6 opacity-70">Загрузка…</div>
        ) : !items.length ? (
          <div className="p-6 opacity-70">Пока нет фотографий</div>
        ) : (
          <ul className="divide-y divide-white/10">
            {items.map((p, idx) => (
              <li key={p.id} className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
                <img
                  src={p.url}
                  alt=""
                  className="w-28 h-20 object-cover rounded-xl border border-white/10"
                />

                <div className="flex-1 w-full">
                  <input
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none"
                    placeholder="Название / подпись"
                    defaultValue={p.title || ''}
                    onBlur={(e) => {
                      const v = e.target.value;
                      if (v !== (p.title || '')) saveField(p.id, { title: v });
                    }}
                  />
                  <div className="mt-2 flex items-center gap-4 text-sm opacity-80">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={!!p.published}
                        onChange={(e) => saveField(p.id, { published: e.target.checked })}
                      />
                      Опубликовано
                    </label>
                    <span>Порядок: {p.sort_index}</span>
                    {savingId === p.id && <span>· сохранение…</span>}
                  </div>
                </div>

                {/* Кнопки порядка и удаления */}
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40"
                    onClick={() => move(p.id, 'up')}
                    disabled={busyId === p.id || idx === 0}
                    title="Вверх"
                  >
                    ↑
                  </button>
                  <button
                    className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40"
                    onClick={() => move(p.id, 'down')}
                    disabled={busyId === p.id || idx === items.length - 1}
                    title="Вниз"
                  >
                    ↓
                  </button>
                  <button
                    className="px-3 py-2 rounded-lg border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-40"
                    onClick={() => remove(p.id, p.url)}
                    disabled={busyId === p.id}
                  >
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
