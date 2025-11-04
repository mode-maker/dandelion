// components/admin/Uploader.jsx
'use client';

import { useCallback, useRef, useState } from 'react';
import { put } from '@vercel/blob';

export default function Uploader({ albumId, onUploaded }) {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  const onPick = useCallback(e => {
    const list = e.target.files;
    if (!list) return;
    const arr = Array.from(list).filter(f => f.type.startsWith('image/'));
    setFiles(arr);
  }, []);

  const startUpload = useCallback(async () => {
    if (!files.length || busy) return;
    setBusy(true);
    setProgress(0);

    const MAX_PARALLEL = 3;
    let done = 0;
    const bump = () => setProgress(Math.round(((++done) / files.length) * 100));
    const queue = [...files];

    async function worker() {
      while (queue.length) {
        const f = queue.shift();

        // без client-side ресайза, чтобы быстрее завести (можем добавить позже)
        const res = await put(`dandelion/${Date.now()}-${f.name}`, f, {
          access: 'public',
          contentType: f.type,
          addRandomSuffix: true,
        });

        await fetch('/api/admin/import-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ albumId, url: res.url }),
        });

        bump();
      }
    }

    await Promise.all(Array.from({ length: MAX_PARALLEL }, () => worker()));
    setBusy(false);
    setFiles([]);
    onUploaded?.();
  }, [files, busy, albumId, onUploaded]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 justify-between">
        <div className="space-y-1">
          <div className="font-medium">Загрузка изображений</div>
          <div className="text-sm opacity-70">Файлы отправятся в Vercel Blob</div>
        </div>
        <div className="flex items-center gap-3">
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={onPick} className="hidden" />
          <button className="px-3 py-1.5 rounded-xl bg-[#556B5A] text-white hover:bg-[#495e50] transition-colors" onClick={() => inputRef.current?.click()} disabled={busy}>
            Выбрать файлы
          </button>
          <button className="px-3 py-1.5 rounded-xl bg-white/10 text-white ring-1 ring-white/10 hover:bg-white/15 transition-colors disabled:opacity-50" onClick={startUpload} disabled={!files.length || busy}>
            Загрузить {files.length ? `(${files.length})` : ''}
          </button>
        </div>
      </div>

      {busy ? (
        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-[#556B5A] transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-1 text-sm opacity-70">Отправка: {progress}%</div>
        </div>
      ) : null}
    </div>
  );
}
