// app/admin/page.jsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminAlbums() {
  const [albums, setAlbums] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  async function load() {
    setLoading(true); setErr('');
    try {
      const r = await fetch('/api/admin/albums', { cache: 'no-store' });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
      setAlbums(Array.isArray(data.items) ? data.items : []);
    } catch (e) { setErr(String(e.message || e)); }
    finally { setLoading(false); }
  }

  async function createAlbum() {
    const t = title.trim();
    if (!t) return;
    try {
      const r = await fetch('/api/admin/albums', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: t }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
      setTitle('');
      await load();
    } catch (e) { alert('Не удалось создать альбом: ' + e.message); }
  }

  useEffect(() => { load(); }, []);

  return (
    <main className="min-h-screen px-4 md:px-8 py-6 bg-[#0e1712] text-[#E7E8E0]">
      <h1 className="text-2xl md:text-3xl font-semibold">Админ-панель · Альбомы</h1>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm opacity-75 mb-2">Создать альбом</div>
        <div className="flex gap-2">
          <input
            className="flex-1 px-3 py-2 rounded-xl bg-black/20 ring-1 ring-white/10 outline-none"
            placeholder="Название альбома"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
          />
          <button
            onClick={createAlbum}
            className="px-4 py-2 rounded-xl bg-white/10 ring-1 ring-white/10 hover:bg-white/15">
            Создать
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm opacity-75 mb-3">Мои альбомы</div>
        {err && <div className="text-red-300 mb-2">{err}</div>}
        {loading ? <div className="opacity-70">Загрузка…</div> : null}
        <ul className="grid md:grid-cols-2 gap-3">
          {albums.map(a => (
            <li key={a.id} className="rounded-xl ring-1 ring-white/10 bg-black/10 p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{a.title}</div>
                <div className="opacity-70 text-sm">{a.photos_count} фото · {new Date(a.created_at).toLocaleString('ru-RU')}</div>
              </div>
              <Link
                href={`/admin/albums/${a.id}`}
                className="px-3 py-1.5 rounded-lg bg-white/10 ring-1 ring-white/10 hover:bg-white/15">
                Открыть
              </Link>
            </li>
          ))}
          {!loading && albums.length === 0 ? <div className="opacity-70">Альбомов пока нет</div> : null}
        </ul>
      </div>
    </main>
  );
}
