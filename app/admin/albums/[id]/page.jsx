'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

function Row({ p, onChange, onDelete, onMoveUp, onMoveDown }) {
  return (
    <div className="flex items-center gap-3 bg-[#0f1612] border border-[#2a3a31] rounded-xl p-3">
      <img src={p.url} alt="" className="w-20 h-20 rounded-md object-cover" />
      <div className="flex-1">
        <input
          className="w-full bg-transparent border border-[#2a3a31] rounded-md px-3 py-1.5"
          placeholder="Название / подпись"
          value={p.title || ''}
          onChange={e => onChange({ ...p, title: e.target.value })}
          onBlur={() => onChange(p, true)}
        />
        <div className="flex items-center gap-4 mt-2 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!p.published}
              onChange={e => onChange({ ...p, published: e.target.checked }, true)}
            />
            Опубликовано
          </label>
          <span className="opacity-60">Порядок {p.sort_index}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button onClick={() => onMoveUp(p)} className="px-3 py-2 rounded-md bg-[#264332] hover:bg-[#2e523e]" title="Вверх">↑</button>
        <button onClick={() => onMoveDown(p)} className="px-3 py-2 rounded-md bg-[#264332] hover:bg-[#2e523e]" title="Вниз">↓</button>
      </div>

      <button onClick={() => onDelete(p)} className="px-3 py-2 rounded-md bg-[#4a1f1f] hover:bg-[#5a2424]">
        Удалить
      </button>
    </div>
  );
}

export default function AlbumPage({ params }) {
  const albumId = Number(params.id);
  const [photos, setPhotos] = useState([]);
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [phRes, alRes] = await Promise.all([
      fetch(`/api/admin/photos?albumId=${albumId}`, { cache: 'no-store' }),
      fetch(`/api/admin/albums`, { cache: 'no-store' })
    ]);
    const ph = await phRes.json();
    const al = await alRes.json();
    setPhotos(ph.items || []);
    setAlbum((al.items || []).find(a => a.id === albumId) || null);
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [albumId]);

  // Локальное обновление полей + сохранение (по blur или чекбоксу)
  async function changePhoto(newP, saveNow = false) {
    setPhotos(prev => prev.map(x => (x.id === newP.id ? newP : x)));
    if (saveNow) {
      await fetch('/api/admin/photos', {
        method: 'PATCH',
        body: JSON.stringify({ id: newP.id, title: newP.title, published: newP.published })
      });
    }
  }

  async function deletePhoto(p) {
    if (!confirm('Удалить фотографию?')) return;
    await fetch('/api/admin/photos', { method: 'DELETE', body: JSON.stringify({ id: p.id, url: p.url }) });
    await load();
  }

  // Перемещение кнопками: меняем sort_index у текущего и «соседа»
  const sorted = useMemo(
    () => [...photos].sort((a, b) => (a.sort_index - b.sort_index) || (a.id - b.id)),
    [photos]
  );

  async function swapOrder(a, b) {
    if (!a || !b) return;
    // Поменять sort_index местами
    await Promise.all([
      fetch('/api/admin/photos', { method: 'PATCH', body: JSON.stringify({ id: a.id, sort_index: b.sort_index }) }),
      fetch('/api/admin/photos', { method: 'PATCH', body: JSON.stringify({ id: b.id, sort_index: a.sort_index }) })
    ]);
    await load();
  }

  function onMoveUp(p) {
    const idx = sorted.findIndex(x => x.id === p.id);
    if (idx > 0) swapOrder(sorted[idx], sorted[idx - 1]);
  }
  function onMoveDown(p) {
    const idx = sorted.findIndex(x => x.id === p.id);
    if (idx >= 0 && idx < sorted.length - 1) swapOrder(sorted[idx], sorted[idx + 1]);
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center gap-4">
        <Link href="/admin/albums" className="text-sm opacity-70 hover:opacity-100">← Назад к галереям</Link>
        <h1 className="text-xl font-semibold">Альбом #{albumId}{album?.title ? ` — ${album.title}` : ''}</h1>
      </div>

      <div className="mb-4 opacity-70 text-sm">
        Загрузка новых фото оставили на общей странице галереи. Здесь — редактирование и порядок.
      </div>

      {loading ? <div className="opacity-70">Загрузка…</div> : (
        <div className="flex flex-col gap-3">
          {sorted.map(p => (
            <Row
              key={p.id}
              p={p}
              onChange={changePhoto}
              onDelete={deletePhoto}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
            />
          ))}
          {!sorted.length && <div className="opacity-70">В этом альбоме пока нет фото.</div>}
        </div>
      )}
    </div>
  );
}
