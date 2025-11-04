// app/admin/page.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Uploader from '@/components/admin/Uploader';

type Photo = {
  id: number;
  album_id: number | null;
  url: string;
  width: number | null;
  height: number | null;
  title: string | null;
  tags: string[] | null;
  published: boolean;
  sort_index: number | null;
  created_at: string;
};

export default function AdminPage() {
  const [items, setItems] = useState<Photo[]>([]);
  const [total, setTotal] = useState(0);
  const [limit] = useState(60);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [albumId, setAlbumId] = useState<number | ''>('');
  const [published, setPublished] = useState<'all'|'true'|'false'>('all');

  const load = useCallback(async (reset = false) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (albumId !== '') params.set('albumId', String(albumId));
    if (q) params.set('q', q);
    if (published !== 'all') params.set('published', published);
    params.set('limit', String(limit));
    params.set('offset', String(reset ? 0 : offset));
    const r = await fetch(`/api/admin/photos?${params.toString()}`, { cache: 'no-store' });
    const data = await r.json();
    setItems(reset ? data.items : [...items, ...data.items]);
    setTotal(data.total);
    setOffset(reset ? data.items.length : offset + data.items.length);
    setLoading(false);
  }, [albumId, q, published, limit, offset, items]);

  useEffect(() => { load(true); }, [albumId, q, published]); // перезагрузка при смене фильтров

  // Виртуализация по вертикали
  const listRef = useRef<HTMLDivElement>(null);
  const ITEM_H = 160;
  const GAP = 12;

  const [range, setRange] = useState({ start: 0, end: 0 });

  const onScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const scrollTop = el.scrollTop;
    const vh = el.clientHeight;
    const per = ITEM_H + GAP;
    const start = Math.max(0, Math.floor(scrollTop / per) - 5);
    const visibleCount = Math.ceil(vh / per) + 10;
    const end = Math.min(items.length, start + visibleCount);
    setRange({ start, end });

    // Догружать следующую страницу ближе к низу
    if (!loading && end > items.length - 10 && items.length < total) {
      load(false);
    }
  }, [items.length, loading, total, load]);

  useEffect(() => { onScroll(); }, [items.length]); // пересчитать диапазон

  const slice = useMemo(() => items.slice(range.start, range.end), [items, range]);

  const updateMeta = useCallback(async (id: number, patch: Partial<Photo>) => {
    // оптимистично
    setItems(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
    await fetch('/api/admin/photos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    }).catch(() => null);
  }, []);

  const remove = useCallback(async (p: Photo) => {
    const ok = confirm('Удалить фото?');
    if (!ok) return;
    setItems(prev => prev.filter(x => x.id !== p.id));
    await fetch('/api/admin/photos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, url: p.url }),
    }).catch(() => null);
  }, []);

  return (
    <main className="min-h-screen px-4 md:px-8 py-6 bg-[#0e1712] text-[#E7E8E0]">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Админ-панель · Галерея</h1>

      {/* Панель фильтров + загрузка */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm opacity-75 mb-2">Фильтры</div>
          <div className="flex flex-col gap-3">
            <input
              className="px-3 py-2 rounded-xl bg-black/20 ring-1 ring-white/10 outline-none"
              placeholder="Поиск по названию/тегам…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <div className="flex gap-2">
              <select
                className="flex-1 px-3 py-2 rounded-xl bg-black/20 ring-1 ring-white/10"
                value={albumId}
                onChange={(e) => setAlbumId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Все альбомы</option>
                {/* Если есть список альбомов — подставь сюда options */}
              </select>
              <select
                className="px-3 py-2 rounded-xl bg-black/20 ring-1 ring-white/10"
                value={published}
                onChange={(e)=>setPublished(e.target.value as any)}
              >
                <option value="all">Все</option>
                <option value="true">Опублик.</option>
                <option value="false">Черновики</option>
              </select>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <Uploader albumId={albumId === '' ? null : albumId} onUploaded={() => load(true)} />
        </div>
      </div>

      {/* Список (виртуализированный контейнер) */}
      <div
        ref={listRef}
        onScroll={onScroll}
        className="mt-6 h-[70vh] overflow-y-auto rounded-2xl border border-white/10 bg-white/5 no-scrollbar"
      >
        {/* Верхний спейсер */}
        <div style={{ height: (ITEM_H + GAP) * range.start }} />

        {slice.map((p, i) => {
          const idx = range.start + i;
          const w = p.width || 1600;
          const h = p.height || 900;
          return (
            <div
              key={p.id}
              className="mx-3 my-[6px] flex items-center gap-4 p-3 rounded-xl bg-black/10 ring-1 ring-white/5 shadow-md hover:shadow-lg transition-shadow"
              style={{ height: ITEM_H }}
            >
              <div className="relative w-48 h-[136px] rounded-lg overflow-hidden ring-1 ring-white/10">
                <Image
                  src={p.url}
                  alt={p.title || ''}
                  width={w}
                  height={h}
                  sizes="192px"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  quality={60}
                />
              </div>

              <div className="flex-1 min-w-0">
                <input
                  className="w-full px-3 py-2 rounded-lg bg-white/5 ring-1 ring-white/10 outline-none mb-2"
                  placeholder="Название / подпись"
                  defaultValue={p.title || ''}
                  onBlur={(e)=>updateMeta(p.id, { title: e.target.value })}
                />

                <input
                  className="w-full px-3 py-2 rounded-lg bg-white/5 ring-1 ring-white/10 outline-none"
                  placeholder="Теги (через запятую)"
                  defaultValue={(p.tags || []).join(', ')}
                  onBlur={(e)=>{
                    const tags = e.target.value.split(',').map(s=>s.trim()).filter(Boolean);
                    updateMeta(p.id, { tags });
                  }}
                />
              </div>

              <div className="flex flex-col items-end gap-2">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    defaultChecked={p.published}
                    onChange={(e)=>updateMeta(p.id, { published: e.target.checked })}
                  />
                  Опубликовано
                </label>
                <button
                  className="px-3 py-1.5 rounded-lg bg-white/10 ring-1 ring-white/10 hover:bg-white/15"
                  onClick={()=>remove(p)}
                >
                  Удалить
                </button>
                <div className="opacity-60 text-xs">
                  {new Date(p.created_at).toLocaleString('ru-RU')}
                </div>
              </div>
            </div>
          );
        })}

        {/* Нижний спейсер */}
        <div style={{ height: Math.max(0, (ITEM_H + GAP) * (items.length - range.end)) }} />

        {loading ? (
          <div className="py-6 text-center opacity-70">Загрузка…</div>
        ) : null}
      </div>
    </main>
  );
}
