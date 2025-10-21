// app/admin/AdminApp.jsx
'use client';

import React, { useState } from 'react';

export default function AdminApp() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState('');
  const [items, setItems] = useState([]); // { url, filename }[]

  async function uploadFiles(selected) {
    if (!selected?.length) return;
    setLoading(true);
    setLog('Загрузка...');

    try {
      for (const f of selected) {
        const fd = new FormData();
        fd.append('file', f);
        fd.append('filename', f.name);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: fd,
        });

        const data = await res.json();
        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || 'Upload failed');
        }

        setItems(prev => [{ url: data.url, filename: data.filename }, ...prev]);
      }
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
      <p className="opacity-80">Загрузите одно или несколько фото — они сохранятся в Blob и появятся ниже.</p>

      <div className="flex items-center gap-3">
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
        <button
          onClick={() => uploadFiles(files)}
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
            <img src={it.url} alt={it.filename} className="w-full h-40 object-cover" />
            <div className="p-2 text-xs">{it.filename}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
