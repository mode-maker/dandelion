'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const fmt = (d) =>
  d ? new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(d)) : '';

async function fetchJSONRetry(url, options) {
  let res = await fetch(url, options);
  if (res.status === 401) res = await fetch(url, options);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function readErrorBodySafely(res) {
  try {
    const txt = await res.text();
    return txt?.slice(0, 500) || '';
  } catch {
    return '';
  }
}

const normalizePhoto = (p) => ({
  id: p?.id,
  url: p?.url || p?.src || '',
  published:
    typeof p?.published === 'boolean'
      ? p.published
      : typeof p?.is_published === 'boolean'
      ? p.is_published
      : true,
  albumId: p?.albumId ?? p?.album_id ?? null,
  sortIndex: p?.sort_index ?? p?.sortIndex ?? null,
});

const normalizeAlbum = (a) => ({
  id: a?.id,
  title: a?.title ?? a?.name ?? `Альбом #${a?.id}`,
  event_date: a?.event_date ?? a?.date ?? null,
});

export default function AdminAlbum({ params }) {
  const albumId = Number(params.id);
  const [album, setAlbum] = useState(null);
  const [items, setItems] = useState([]);           // для управления
  const [pubPreview, setPubPreview] = useState([]); // опубликованные для верхней ленты
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const stripRef = useRef(null);
  const touchStartX = useRef(0);

  async function load() {
    setMsg('');
    // альбом (admin -> fallback public)
    try {
      const albums = await fetchJSONRetry('/api/admin/albums', { cache: 'no-store' });
      const found = (Array.isArray(albums) ? albums : []).find((a) => a.id == albumId);
      if (found) setAlbum(normalizeAlbum(found));
    } catch {
      try {
        const all = await fetch('/api/albums', { cache: 'no-store' }).then((r) => r.json());
        const found = (Array.isArray(all) ? all : []).find((a) => a.id == albumId);
        if (found) setAlbum(normalizeAlbum(found));
      } catch {}
    }

    // фото для управления (admin), поддерживаем оба имени параметра
    try {
      const qs = `albumId=${albumId}&album_id=${albumId}&includeHidden=1`;
      const res = await fetch(`/api/admin/photos?${qs}`, { cache: 'no-store' });
      if (!res.ok) {
        const body = await readErrorBodySafely(res);
        throw new Error(`${res.status} ${res.statusText}${body ? ` — ${body}` : ''}`);
      }
      const raw = await res.json();
      const list = Array.isArray(raw) ? raw.map(normalizePhoto) : [];
      setItems(list);
    } catch (e) {
      setItems([]);
      setMsg(
        `Не удалось получить фото из админ-API: ${e.message}. ` +
          `Открой DevTools → Network → /api/admin/photos и посмотри ответ сервера.`
      );
    }

    // превью как на сайте (public)
    try {
      const all = await fetch('/api/albums', { cache: 'no-store' }).then((r) => r.json());
      const found = (Array.isArray(all) ? all : []).find((a) => a.id == albumId);
      const pp = Array.isArray(found?.photos) ? found.photos.map(normalizePhoto).filter((x) => x.published) : [];
      setPubPreview(pp);
    } catch {
      setPubPreview([]);
    }
  }

  useEffect(() => {
    load();
  }, [albumId]);

  // прокрутка превью
  const scrollBy = (dir = 1) => {
    const el = stripRef.current;
    if (!el) return;
    el.scrollBy({ left: Math.round(el.clientWidth * 0.85) * dir, behavior: 'smooth' });
  };
  const onTouchStart = (e) => (touchStartX.current = e.touches?.[0]?.clientX || 0);
  const onTouchEnd = (e) => {
    const dx = (e.changedTouches?.[0]?.clientX || 0) - touchStartX.current;
    if (Math.abs(dx) >= 40) scrollBy(dx > 0 ? -1 : 1);
  };

  // управление порядком
  function move(i, j) {
    setItems((prev) => {
      const arr = prev.slice();
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
    setMsg('Изменён порядок (пока не сохранён). Нажмите «Сохранить порядок».');
  }

  async function saveOrder() {
    setSaving(true);
    try {
      const ids = items.map((x) => x.id);
      await fetchJSONRetry('/api/admin/photos/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, albumId }),
      });
      setMsg('Порядок сохранён');
      await load();
    } catch (e) {
      setMsg(e.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(it) {
    await fetchJSONRetry(`/api/admin/photos/${it.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !it.published }),
    });
    await load();
  }

  async function remove(it) {
    if (!confirm('Удалить фото?')) return;
    await fetchJSONRetry(`/api/admin/photos/${it.id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-0)]">
      <style jsx global>{`
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold text-[color:var(--aurora-3)]">
            Альбом: {album?.title || `#${albumId}`} {album?.event_date ? `• ${fmt(album.event_date)}` : ''}
          </h1>
          <Link href="/admin" className="px-4 py-2 rounded-xl bg-white/10 text-white ring-1 ring-white/10">
            ← К альбомам
          </Link>
        </div>

        {/* Превью как на публичном сайте */}
        <section className="mt-6 p-5 rounded-2xl bg-[color:var(--bg-1)] shadow-lg shadow-black/20 ring-1 ring-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between pb-3">
            <h2 className="text-[color:var(--aurora-3)] text-sm uppercase tracking-wide">Превью</h2>
            <div className="hidden md:flex gap-2">
              <button onClick={() => scrollBy(-1)} className="h-9 w-9 grid place-items-center rounded-xl bg-white/10 ring-1 ring-white/10 text-white hover:bg-white/15">←</button>
              <button onClick={() => scrollBy(1)} className="h-9 w-9 grid place-items-center rounded-xl bg-white/10 ring-1 ring-white/10 text-white hover:bg-white/15">→</button>
            </div>
          </div>

          <div className="px-0 pb-2">
            <div
              ref={stripRef}
              className="no-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {pubPreview.map((p) => (
                <figure key={`pub-${p.id}`} className="min-w-[300px] md:min-w-[420px] snap-start rounded-2xl overflow-hidden bg-black/10 ring-1 ring-white/5 shadow-md">
                  <img src={p.url} className="w-full h-56 object-cover" alt="" />
                </figure>
              ))}
              {pubPreview.length === 0 && <div className="text-white/70 px-2 py-4">Нет опубликованных фото.</div>}
            </div>
          </div>

          <button onClick={() => scrollBy(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center rounded-full bg-black/40 backdrop-blur ring-1 ring-white/10 text-white hover:bg-black/55">←</button>
          <button onClick={() => scrollBy(1)} className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center rounded-full bg-black/40 backdrop-blur ring-1 ring-white/10 text-white hover:bg-black/55">→</button>
        </section>

        {/* Панель управления без кнопки "Сделать обложкой" */}
        <section className="mt-6 p-5 rounded-2xl bg-[color:var(--bg-1)] shadow-lg shadow-black/20 ring-1 ring-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-[color:var(--aurora-3)] text-sm uppercase tracking-wide">Панель управления</h2>
            <button
              onClick={saveOrder}
              disabled={saving || items.length === 0}
              className="px-4 py-2 rounded-xl bg-[#556B5A] hover:bg-[#5e7569] disabled:opacity-50"
            >
              {saving ? 'Сохраняем…' : 'Сохранить порядок'}
            </button>
          </div>

          {msg && <div className="mt-3 text-sm text-white/80">{msg}</div>}

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
            {items.map((it, i) => (
              <div key={it.id} className="w-full max-w-[520px] overflow-hidden rounded-2xl bg-black/10 ring-1 ring-white/5 shadow-lg">
                <img src={it.url} className="w-full h-48 object-cover" alt="" />
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-lg text-xs bg-white/8 ring-1 ring-white/10">{i + 1}</span>
                  <span className={it.published
                    ? 'text-xs px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-300/20'
                    : 'text-xs px-2 py-0.5 rounded-md bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-300/20'}>
                    {it.published ? 'Публикуется' : 'Скрыто'}
                  </span>
                </div>
                <div className="px-3 pb-3 flex flex-wrap items-center gap-2">
                  <button onClick={() => i > 0 && move(i, i - 1)} className="h-8 px-3 rounded-lg bg-white/5 ring-1 ring-white/10">↑ Вверх</button>
                  <button onClick={() => i < items.length - 1 && move(i, i + 1)} className="h-8 px-3 rounded-lg bg-white/5 ring-1 ring-white/10">↓ Вниз</button>
                  <button onClick={() => togglePublish(it)} className="h-8 px-3 rounded-lg bg-white/5 ring-1 ring-white/10">
                    {it.published ? 'Скрыть' : 'Показать'}
                  </button>
                  <button onClick={() => remove(it)} className="h-8 px-3 rounded-lg bg-red-500/15 text-red-300">Удалить</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
