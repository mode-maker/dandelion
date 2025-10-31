// app/admin/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function AdminAlbums() {
  const router = useRouter();

  const [albums, setAlbums] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function load() {
    setErr('');
    const res = await fetch('/api/admin/albums', { cache: 'no-store' });
    const data = await res.json().catch(() => []);
    setAlbums(Array.isArray(data) ? data : []);
    setDirty(false);
  }
  useEffect(() => { load(); }, []);

  async function createAlbum(redirect = true) {
    if (!title.trim()) return setErr('Введите название альбома');
    setLoading(true); setErr('');
    try {
      const res = await fetch('/api/admin/albums', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ title: title.trim(), event_date: date || null })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || 'Не удалось создать альбом');

      setTitle(''); setDate('');
      if (redirect && j?.id) {
        // сразу открываем страницу альбома, где есть загрузка фото
        router.push(`/admin/albums/${j.id}`);
        return;
      }
      await load();
    } catch (e) {
      setErr(e.message || 'Ошибка создания альбома');
    } finally {
      setLoading(false);
    }
  }

  function move(i, j) {
    setAlbums(prev => {
      const arr = prev.slice();
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
    setDirty(true);
  }

  async function saveOrder() {
    const ids = albums.map(a => a.id);
    const res = await fetch('/api/admin/albums/reorder', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ ids })
    });
    if (res.ok) { setDirty(false); await load(); }
  }

  async function togglePublished(a) {
    await fetch(`/api/admin/albums/${a.id}`, {
      method: 'PATCH',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ published: !a.published })
    });
    await load();
  }

  async function removeAlbum(a) {
    if (!confirm('Удалить альбом? Фото тоже удалятся.')) return;
    await fetch(`/api/admin/albums/${a.id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-0)]">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        <h1 className="text-2xl md:text-3xl font-semibold text-[color:var(--aurora-3)] text-center">
          Админ · Альбомы
        </h1>

        <section className="mt-8 p-5 rounded-2xl bg-[color:var(--bg-1)] shadow-lg shadow-black/20 ring-1 ring-white/5">
          <h2 className="text-[color:var(--aurora-3)] text-sm uppercase tracking-wide">Создать альбом</h2>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <input
              value={title}
              onChange={e=>setTitle(e.target.value)}
              placeholder="Название (например, МК «Осенние флорариумы»)"
              className="px-3 py-2 rounded-lg bg-white/5 ring-1 ring-white/10 text-white outline-none flex-1"
            />
            <input
              value={date}
              onChange={e=>setDate(e.target.value)}
              type="date"
              className="px-3 py-2 rounded-lg bg-white/5 ring-1 ring-white/10 text-white outline-none"
            />
            <button
              onClick={() => createAlbum(true)}
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#556B5A] hover:bg-[#5e7569] disabled:opacity-50"
              title="Создать альбом и перейти к загрузке фото"
            >
              {loading ? 'Создаём…' : 'Создать альбом'}
            </button>
          </div>
          {err && <div className="mt-3 text-sm text-red-400">{err}</div>}
        </section>

        <section className="mt-8 p-5 rounded-2xl bg-[color:var(--bg-1)] shadow-lg shadow-black/20 ring-1 ring-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-[color:var(--aurora-3)] text-sm uppercase tracking-wide">Список альбомов</h2>
            <button
              onClick={saveOrder}
              disabled={!dirty}
              className={`${dirty ? 'px-5 py-2 rounded-xl bg-[#556B5A] hover:bg-[#5e7569]' : 'px-5 py-2 rounded-xl bg-white/10 text-white/60'}`}
            >
              Сохранить порядок
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((a, i) => (
              <div key={a.id} className="overflow-hidden rounded-2xl bg-black/10 shadow-lg shadow-black/20 ring-1 ring-white/5">
                <img src={a.cover_url || '/og-image.jpg'} alt={a.title} className="w-full h-40 object-cover" />
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-white/85 text-sm">{a.title}</div>
                    <div className="text-white/60 text-xs">{a.event_date || '—'}</div>
                  </div>
                  <div className="mt-2 text-white/70 text-xs">
                    {a.published ? 'Публикуется' : 'Скрыт'} • {a.published_count ?? 0} фото
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => i>0 && move(i, i-1)} className="h-8 w-8 grid place-items-center rounded-lg bg-white/5 ring-1 ring-white/10">↑</button>
                    <button onClick={() => i<albums.length-1 && move(i, i+1)} className="h-8 w-8 grid place-items-center rounded-lg bg-white/5 ring-1 ring-white/10">↓</button>
                    <button onClick={() => togglePublished(a)} className="px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10">
                      {a.published ? 'Скрыть' : 'Показать'}
                    </button>
                    <Link href={`/admin/albums/${a.id}`} className="px-3 py-1.5 rounded-lg bg-[#556B5A] hover:bg-[#5e7569]">
                      Открыть
                    </Link>
                    <button onClick={() => removeAlbum(a)} className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-300">
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
