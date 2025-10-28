// app/admin/AdminApp.jsx
'use client';

import { useState, useRef, useMemo } from 'react';
import { handleUpload } from '@vercel/blob/client';

export default function AdminApp() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploaded, setUploaded] = useState([]);
  const inputRef = useRef(null);

  const onFilesChosen = (list) => {
    setError('');
    const arr = Array.from(list || []).filter((f) =>
      ['image/jpeg','image/png','image/webp'].includes(f.type)
    );
    setFiles(arr);
    setUploaded([]);
    setProgress(0);
  };

  const pretty = (bytes) => {
    if (bytes == null) return '';
    const units = ['B','KB','MB','GB']; let i=0, v=bytes;
    while (v >= 1024 && i < units.length-1) { v/=1024; i++; }
    return `${v.toFixed(1)} ${units[i]}`;
  };
  const totalSize = useMemo(() => files.reduce((a,f)=>a+(f?.size||0),0), [files]);

  async function doUpload() {
    if (!files.length) return;
    setUploading(true); setError(''); setProgress(0); setUploaded([]);

    try {
      console.log('[upload] start -> files:', files.map(f=>f.name));
      const { uploaded } = await handleUpload(files, {
        endpoint: '/api/admin/upload',
        onUploadProgress({ uploaded, total }) {
          if (typeof total === 'number' && total > 0) {
            setProgress(Math.round((uploaded / total) * 100));
          }
        },
      });
      console.log('[upload] success:', uploaded);
      setUploaded(uploaded || []);
      setProgress(100);
      setFiles([]);
    } catch (e) {
      console.error('[upload] error:', e);
      setError(e?.message || 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-semibold">Админ: Загрузка фотографий</h1>
        <p className="mt-2 text-neutral-400">
          Файлы отправляются <span className="font-mono">POST</span> на <span className="font-mono">/api/admin/upload</span>.
        </p>

        <div
          className="mt-6 rounded-2xl border border-dashed border-neutral-700 p-8 text-center"
          onDragOver={(e)=>e.preventDefault()}
          onDrop={(e)=>{e.preventDefault(); onFilesChosen(e.dataTransfer.files);}}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e)=>onFilesChosen(e.target.files)}
          />
          <button
            type="button"
            onClick={()=>inputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700"
            disabled={uploading}
          >
            Выбрать файлы
          </button>

          <div className="mt-3 text-neutral-400">или перетащи файлы сюда</div>

          {!!files.length && (
            <div className="mt-5 text-left">
              <div className="text-sm text-neutral-400 mb-2">
                Выбрано: {files.length} • Общий размер: {pretty(totalSize)}
              </div>
              <ul className="space-y-1 text-sm">
                {files.map(f=>(
                  <li key={f.name} className="truncate">
                    {f.name} <span className="text-neutral-500">({pretty(f.size)})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3 justify-center">
            <button
              type="button"
              onClick={doUpload}               // <-- жмём и летит POST
              disabled={!files.length || uploading}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
            >
              {uploading ? 'Загрузка…' : 'Загрузить'}
            </button>
            {uploading && <div className="text-sm text-neutral-400">Прогресс: {progress}%</div>}
          </div>

          {error && <div className="mt-4 text-sm text-red-400">{error}</div>}
        </div>

        {!!uploaded.length && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold">Загружено:</h2>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {uploaded.map(u=>(
                <figure key={u.url} className="rounded-xl overflow-hidden border border-neutral-800" title={u.pathname}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u.url} alt={u.pathname} className="w-full h-40 object-cover" />
                  <figcaption className="p-2 text-xs text-neutral-400 break-all">{u.pathname}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
