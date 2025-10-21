// app/admin/AdminApp.jsx
'use client';

import React, { useState } from 'react';
import { handleUpload } from '@vercel/blob/client';

export default function AdminApp() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState('');
  const [items, setItems] = useState([]); // { url, pathname }[]

  async function startUpload(selected) {
    if (!selected?.length) return;
    setLoading(true);
    setLog('Готовим загрузку…');

    try {
      // ЗДЕСЬ важен endpoint: наш серверный роут
      const result = await handleUpload(selected, {
        endpoint: '/api/admin/upload',
        onUploadProgress: ({ progress }) => {
          setLog(`Загрузка: ${Math.round(progress * 100)}%`);
        },
        onUploadCompleted: ({ blob }) => {
          // blob.url — публичная ссылка из Vercel Blob
          setItems(prev => [{ url: blob.url, pathname: blob.pathname }, ...prev]);
        },
      });

      if (!result) throw new Error('Upload failed');
      setLog('Готово ✅');
    } catch (e) {
      const msg = e?.message || String(e);
      setLog('Ошибка: ' + msg);
      alert('Ошибка загрузки: ' + msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Админ • Галерея</h1>
      <p className="opacity-80">
        Выберите фото и загрузите. Они попадут в Vercel Blob и автоматически запишутся в базу.
      </p>

      <div className="flex items-center gap-3">
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
        <button
          onClick={() => startUpload(files)}
          disabled={loading || !files.length}
          className="px-4 py-2 rounded-xl border border-white/20"
        >
          {loading ? 'Загрузка…' : 'Загрузить'}
        </button>
      </div>

      <div className="text-sm opacity-70">{log}</div>

      <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
        {items.map((it, i) => (
          <div key={i} className="rounded-xl overflow-hidden border border-white/10">
            <img src={it.url} alt="" className="w-full h-40 object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
