// app/admin/AdminApp.jsx
'use client';

import { useRef, useState } from 'react';

export default function AdminApp() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');
  const inputRef = useRef(null);

  function onFilesChosen(list) {
    setError('');
    setOkMsg('');
    setFiles(Array.from(list || []));
  }

  async function doUpload() {
    if (!files.length || uploading) return;
    setUploading(true);
    setError('');
    setOkMsg('');

    try {
      const formData = new FormData();
      for (const f of files) formData.append('files', f);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Ошибка загрузки');

      setOkMsg(`✅ Загружено: ${Array.isArray(data.uploaded) ? data.uploaded.length : 0}`);
      setFiles([]);
    } catch (e) {
      setError(e.message || 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-10">
      <h1 className="text-2xl md:text-3xl font-semibold">
        Админ: Загрузка фотографий
      </h1>
      <p className="mt-2 text-neutral-400">
        Файлы отправляются POST на <span className="font-mono">/api/admin/upload</span>.
      </p>

      <div
        className="mt-6 rounded-2xl border border-dashed border-neutral-700 p-8 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFilesChosen(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => onFilesChosen(e.target.files)}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700"
          disabled={uploading}
        >
          Выбрать файлы
        </button>

        {files.length > 0 && (
          <ul className="mt-4 text-sm text-left space-y-1">
            {files.map((f) => (
              <li key={f.name} className="truncate">
                {f.name} <span className="text-neutral-500">({(f.size / 1024 / 1024).toFixed(1)} MB)</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={doUpload}
            disabled={!files.length || uploading}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
          >
            {uploading ? 'Загрузка…' : 'Загрузить'}
          </button>
        </div>

        {okMsg && <div className="mt-3 text-sm text-emerald-400">{okMsg}</div>}
        {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
      </div>
    </div>
  );
}
