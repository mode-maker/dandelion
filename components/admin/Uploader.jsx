// components/admin/Uploader.jsx
'use client';

import { useRef, useState } from 'react';
import { put } from '@vercel/blob';

// читаем из NEXT_PUBLIC_ (клиент), а если вдруг нет — пробуем серверное имя (на dev)
const BLOB_TOKEN =
  process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN ||
  process.env.BLOB_READ_WRITE_TOKEN || '';

export default function Uploader({ albumId = null, onUploaded }) {
  const [queue, setQueue] = useState([]);
  const [busy, setBusy] = useState(false);
  const progressRef = useRef(0);

  function handleFiles(files) {
    setQueue(Array.from(files || []));
  }

  async function uploadAll() {
    if (!queue.length) return;
    if (!BLOB_TOKEN) {
      alert('Нет токена Vercel Blob. Добавь NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN в переменные окружения.');
      return;
    }
    setBusy(true);
    try {
      for (let i = 0; i < queue.length; i++) {
        const f = queue[i];

        const res = await put(`dandelion/${Date.now()}-${f.name}`, f, {
          access: 'public',
          contentType: f.type || 'application/octet-stream',
          addRandomSuffix: true,
          token: BLOB_TOKEN, // <<< ВАЖНО
        });

        await fetch('/api/admin/import-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            albumId,
            url: res.url,
            width: null,
            height: null,
            title: '',
          }),
        });

        progressRef.current = Math.round(((i + 1) / queue.length) * 100);
      }
      setQueue([]);
      onUploaded?.();
    } catch (e) {
      console.error('upload failed', e);
      alert('Ошибка загрузки: ' + (e?.message || e));
    } finally {
      setBusy(false);
      progressRef.current = 0;
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium">Загрузка изображений</div>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 ring-1 ring-white/10 hover:bg-white/15 cursor-pointer">
            <input type="file" accept="image/*" multiple className="hidden"
                   onChange={(e) => handleFiles(e.target.files)} />
            Выбрать файлы
          </label>
          <button className="px-3 py-1.5 rounded-xl bg-white/10 ring-1 ring-white/10 disabled:opacity-50"
                  disabled={!queue.length || busy}
                  onClick={uploadAll}>
            Загрузить ({queue.length || 0})
          </button>
        </div>
      </div>

      <div className="mt-3 text-sm opacity-70">Файлы отправятся в Vercel Blob</div>

      {busy ? (
        <div className="mt-2 h-2 rounded bg-black/20 overflow-hidden">
          <div className="h-2 bg-white/50 transition-all" style={{ width: `${progressRef.current}%` }} />
        </div>
      ) : null}
    </div>
  );
}
