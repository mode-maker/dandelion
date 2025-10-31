// app/admin/albums/[id]/page.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function AdminAlbumPhotos({ params }) {
  const albumId = Number(params.id);
  const [album, setAlbum] = useState(null);
  const [items, setItems] = useState([]);
  const [queue, setQueue] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const inputRef = useRef(null);

  async function loadAlbum() {
    setErr('');
    const list = await fetch('/api/admin/albums', { cache: 'no-store' }).then(r => r.json()).catch(() => []);
    const a = (list || []).find(x => x.id === albumId) || null;
    setAlbum(a);
  }
  async function loadPhotos() {
    setErr('');
    const res = await fetch(`/api/admin/photos?albumId=${albumId}`, { cache: 'no-store' });
    const data = await res.json().catch(() => []);
    setItems(Array.isArray(data) ? data : []);
  }

  useEffect(() => { loadAlbum(); loadPhotos(); }, [albumId]);

  function onFiles(e) {
    const arr = Array.from(e.target.files || []);
    const imgs = arr.filter(f => f.type.startsWith('image/'));
    setQueue(q => [...q, ...imgs]);
  }
  function removeFromQueue(i) { setQueue(prev => prev.filter((_, idx) => idx !== i)); }
  function clearQueue() { setQueue([]); if (inputRef.current) inputRef.current.value = ''; }

  async function upload() {
    if (!queue.length) return;
    setUploading(true); setErr(''); setMsg('');
    try {
      let uploadedCount = 0;
      for (const f of queue) {
        const fd = new FormData();
        fd.append('files', f);
        // ВАЖНО: передаём albumId
        fd.append('albumId', String(albumId));

        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        const j = await res.json().catch(async () => ({ error: await res.text() }));
        if (!res.ok) throw new Error(j?.error || 'Upload failed');
        uploadedCount += Array.isArray(j?.uploaded) ? j.uploaded.length : 1;
      }
      setMsg(`✅ Загружено: ${uploadedCount}`);
      clearQueue();
      await loadPhotos();
    } catch (e) {
      setErr(e.message || 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  }

  function move(i, j) {
    setItems(prev => { const arr = prev.slice(); [arr[i], arr[j]] = [arr[j], arr[i]]; return arr; });
  }
  async function saveOrder() {
    const ids = items.map(x => x.id);
    const res = await fetch('/api/admin/photos/reorder', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, albumId })
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { setErr(j?.error || 'Не удалось сохранить порядок'); return; }
    await loadPhotos();
  }
  async function toggle(it) {
    const res = await fetch(`/api/admin/photos/${it.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !it.published })
    });
    if (!res.ok) { setErr('Ошибка переключения статуса'); }
    await loadPhotos();
  }
  async function remove(it) {
    if (!confirm('Удалить фото?')) return;
    const res = await fetch(`/api/admin/photos/${it.id}`, { method:'DELETE' });
    if (!res.ok) { setErr('Ошибка удаления'); }
    await loadPhotos();
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-0)]">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold text-[color:var(--aurora-3)]">
            Альбом: {album?.title || `#${albumId}`} {album?.event_date ? `· ${album.event_date}` : ''}
          </h1>
          <Link href="/admin" className="px-4 py-2 rounded-xl bg-white/10">← К альбомам</Link>
        </div>

        <section className="mt-6 p-5 rounded-2xl bg-[color:var(--bg-1)] shadow-lg shadow-black/20 ring-1 ring-white/5">
          <h2 className="text-[color:var(--aurora-3)] text-sm uppercase tracking-wide">Загрузка фото</h2>
          <div className="mt-3 flex items-center gap-3">
            <input ref={inputRef} type="file" accept="image/*" multiple onChange={onFiles} className="hidden" id="pick" />
            <label htmlFor="pick" className="px-5 py-2 rounded-xl bg-[#556B5A] hover:bg-[#5e7569] cursor-pointer">Выбрать файлы</label>
            <button onClick={upload} disabled={!queue.length || uploading} className="px-5 py-2 rounded-xl bg-[#556B5A] hover:bg-[#5e7569] disabled:opacity-50">
              {uploading ? 'Загрузка…' : 'Загрузить'}
            </button>
            <button onClick={clearQueue} disabled={!queue.length || uploading} className="px-4 py-2 rounded-xl bg-white/10">Очистить</button>
          </div>
          {!!queue.length && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {queue.map((f, i) => {
                const url = URL.createObjectURL(f);
                return (
                  <div key={i} className="overflow-hidden rounded-2xl bg-black/10 ring-1 ring-white/5">
                    <img src={url} alt={f.name} className="w-full h-32 object-cover" onLoad={() => URL.revokeObjectURL(url)} />
                    <button onClick={() => removeFromQueue(i)} className="w-full text-xs py-1.5 bg-white/10">Убрать</button>
                  </div>
                );
              })}
            </div>
          )}
          {msg && <div className="mt-3 text-sm text-emerald-400">{msg}</div>}
          {err && <div className="mt-3 text-sm text-red-400">{err}</div>}
        </section>

        {/* Превью как на сайте */}
        <section className="mt-8 p-5 rounded-2xl bg-[color:var(--bg-1)] shadow-lg shadow-black/20 ring-1 ring-white/5">
          <h2 className="text-[color:var(--aurora-3)] text-sm uppercase tracking-wide">Превью как на сайте</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
            {items.filter(x => x.published).map(p => (
              <figure key={p.id} className="w-full max-w-[520px] rounded-2xl overflow-hidden bg-black/10 ring-1 ring-white/5 shadow-lg">
                <img src={p.url} alt="" className="w-full h-40 object-cover" />
                <figcaption className="px-3 py-2 text-right text-xs text-white/80">{p.ordinal}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Управление */}
        <section className="mt-8 p-5 rounded-2xl bg-[color:var(--bg-1)] shadow-lg shadow-black/20 ring-1 ring-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-[color:var(--aurora-3)] text-sm uppercase tracking-wide">Управление</h2>
            <button onClick={saveOrder} className="px-5 py-2 rounded-xl bg-[#556B5A] hover:bg-[#5e7569]">Сохранить порядок</button>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
            {items.map((it, i) => (
              <div key={it.id} className="overflow-hidden rounded-2xl bg-black/10 ring-1 ring-white/5 shadow-lg w-full max-w-[520px]">
                <img src={it.url} className="w-full h-40 object-cover" alt="" />
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-lg text-xs bg-white/8 ring-1 ring-white/10">{it.ordinal ?? it.id}</span>
                  <span className={it.published ? 'text-xs px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-300/20' : 'text-xs px-2 py-0.5 rounded-md bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-300/20'}>
                    {it.published ? 'Публикуется' : 'Скрыто'}
                  </span>
                </div>
                <div className="px-3 pb-3 flex items-center gap-2">
                  <button onClick={() => i > 0 && (move(i, i - 1))} className="h-8 w-8 grid place-items-center rounded-lg bg-white/5 ring-1 ring-white/10">↑</button>
                  <button onClick={() => i < items.length - 1 && (move(i, i + 1))} className="h-8 w-8 grid place-items-center rounded-lg bg-white/5 ring-1 ring-white/10">↓</button>
                  <button onClick={() => toggle(it)} className="px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10">{it.published ? 'Скрыть' : 'Показать'}</button>
                  <button onClick={() => remove(it)} className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-300">Удалить</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
