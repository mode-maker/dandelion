// app/admin/albums/[id]/page.jsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Uploader from '../../../components/admin/Uploader';

export default function AdminAlbumPage({ params }) {
  const albumId = Number(params.id);
  const [album, setAlbum] = useState(null);
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  const dragFrom = useRef(null);

  const load = useCallback(async () => {
    try {
      setErr('');
      const [aR, pR] = await Promise.all([
        fetch(`/api/admin/albums/${albumId}`, { cache: 'no-store' }),
        fetch(`/api/admin/albums/${albumId}/photos`, { cache: 'no-store' }),
      ]);
      const a = await aR.json(); const p = await pR.json();
      if (!aR.ok) throw new Error(a?.error || 'album load error');
      if (!pR.ok) throw new Error(p?.error || 'photos load error');
      setAlbum(a.album);
      const arr = Array.isArray(p.items) ? p.items : [];
      // нормализуем sort_index (по порядку)
      setItems(arr.map((x, i) => ({ ...x, sort_index: i })));
    } catch (e) { setErr(String(e.message || e)); }
  }, [albumId]);

  useEffect(() => { load(); }, [load]);

  // drag & drop
  function onDragStart(idx) { return () => (dragFrom.current = idx); }
  function onDragOver(e) { e.preventDefault(); }
  function onDrop(idx) {
    return (e) => {
      e.preventDefault();
      const from = dragFrom.current;
      if (from == null || from === idx) return;
      const a = [...items];
      const [moved] = a.splice(from, 1);
      a.splice(idx, 0, moved);
      // перенумеруем sort_index
      const withOrder = a.map((it, i) => ({ ...it, sort_index: i }));
      setItems(withOrder);
      dragFrom.current = null;
    };
  }

  async function saveOrder() {
    try {
      const order = items.map(it => ({ id: it.id, sort_index: it.sort_index }));
      const r = await fetch(`/api/admin/albums/${albumId}/photos`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      });
      if (!r.ok) {
        const t = await r.json().catch(() => ({}));
        throw new Error(t?.error || `HTTP ${r.status}`);
      }
      alert('Порядок сохранён ✅');
    } catch (e) { alert('Не удалось сохранить порядок: ' + e.message); }
  }

  async function updateOne(id, patch) {
    try {
      setItems(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
      await fetch('/api/admin/photos', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...patch }),
      });
    } catch (e) { console.error(e); }
  }

  async function removeOne(p) {
    if (!confirm('Удалить фото?')) return;
    setItems(prev => prev.filter(x => x.id !== p.id));
    try {
      await fetch('/api/admin/photos', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: p.id, url: p.url }),
      });
    } catch (e) { console.error(e); }
  }

  async function renameAlbum(newTitle) {
    try {
      await fetch(`/api/admin/albums/${albumId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      setAlbum(a => ({ ...a, title: newTitle }));
    } catch (e) { alert('Не удалось переименовать: ' + e.message); }
  }

  return (
    <main className="min-h-screen px-4 md:px-8 py-6 bg-[#0e1712] text-[#E7E8E0]">
      <div className="flex items-center gap-3">
        <a href="/admin" className="opacity-70 hover:opacity-100">← к альбомам</a>
        <h1 className="text-2xl md:text-3xl font-semibold">Альбом</h1>
      </div>

      {album ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
          <input
            className="flex-1 px-3 py-2 rounded-xl bg-black/20 ring-1 ring-white/10 outline-none"
            defaultValue={album.title}
            onBlur={(e)=>renameAlbum(e.target.value)}
          />
          <span className="opacity-70 text-sm">{new Date(album.created_at).toLocaleString('ru-RU')}</span>
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <Uploader albumId={albumId} onUploaded={load} />
      </div>

      {err && <div className="text-red-300 mt-4">{err}</div>}

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm opacity-75">Фотографии (перетащи, чтобы изменить порядок)</div>
          <button onClick={saveOrder} className="px-3 py-1.5 rounded-lg bg-white/10 ring-1 ring-white/10 hover:bg-white/15">
            Сохранить порядок
          </button>
        </div>

        <ul className="grid md:grid-cols-2 gap-3">
          {items.map((p, idx) => (
            <li
              key={p.id}
              draggable
              onDragStart={onDragStart(idx)}
              onDragOver={onDragOver}
              onDrop={onDrop(idx)}
              className="p-3 rounded-xl ring-1 ring-white/10 bg-black/10 flex gap-3 items-center"
            >
              <div className="relative w-40 h-24 rounded-lg overflow-hidden ring-1 ring-white/10 shrink-0">
                <Image src={p.url} alt={p.title || ''} fill className="object-cover" sizes="160px" unoptimized />
              </div>
              <div className="flex-1 min-w-0">
                <input
                  className="w-full px-3 py-2 rounded-lg bg-white/5 ring-1 ring-white/10 outline-none mb-2"
                  placeholder="Название / подпись"
                  defaultValue={p.title || ''}
                  onBlur={(e)=>updateOne(p.id, { title: e.target.value })}
                />
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked={p.published}
                         onChange={(e)=>updateOne(p.id, { published: e.target.checked })}/>
                  Опубликовано
                </label>
              </div>
              <button onClick={()=>removeOne(p)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 ring-1 ring-white/10 hover:bg-white/15">
                Удалить
              </button>
            </li>
          ))}
        </ul>

        {!items.length ? <div className="opacity-70">Фотографий пока нет</div> : null}
      </div>
    </main>
  );
}
