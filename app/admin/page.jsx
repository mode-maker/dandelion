// app/admin/page.jsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Uploader from '../../components/admin/Uploader';

export default function AdminPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit] = useState(60);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [albumId, setAlbumId] = useState('');
  const [published, setPublished] = useState('all');

  const load = useCallback(
    async (reset = false) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (albumId !== '') params.set('albumId', String(albumId));
      if (q) params.set('q', q);
      if (published !== 'all') params.set('published', published);
      params.set('limit', String(limit));
      params.set('offset', String(reset ? 0 : offset));

      try {
        const r = await fetch(`/api/admin/photos?${params.toString()}`, {
          cache: 'no-store',
        });
        const data = await r.json();

        const nextItems = Array.isArray(data.items) ? data.items : [];
        setItems(reset ? nextItems : [...items, ...nextItems]);
        setTotal(Number(data.total || 0));
        setOffset(reset ? nextItems.length : offset + nextItems.length);
      } catch (e) {
        console.error('Photos load failed:', e);
      } finally {
        setLoading(false);
      }
    },
    [albumId, q, published, limit, offset, items]
  );

  // первичная загрузка + перезагрузка при смене фильтров
  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumId, q, published]);

  // Простая вертикальная виртуализация списка
  const listRef = useRef(null);
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

    // подгрузка следующей порции
    if (!loading && end > items.length - 10 && items.length < total) {
      load(false);
    }
  }, [items.length, loading, total, load]);

  useEffect(() => {
    onScroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const slice = useMemo(
    () => items.slice(range.start, range.end),
    [items, range]
  );

  const updateMeta = useCallback(async (id, patch) => {
    setItems((prev) => prev
