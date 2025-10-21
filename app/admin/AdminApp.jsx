// app/admin/AdminApp.jsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { upload } from '@vercel/blob/client'; // клиентский helper

export default function AdminApp() {
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState([]);

  const loadPhotos = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/photos', { cache: 'no-store' });
      const data = await r.json();
      setPhotos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const onChange = (e) => {
    setFiles(Array.from(e.target.files || []));
    setProgress(0);
    setError('');
  };

  const onUpload = async () => {
    if (!files.length || busy) return;
    setBusy(true);
    setError('');

    try {
      // Загружаем ПО ОЧЕРЕДИ, показываем прогресс для текущего файла
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        setProgress(0);

        await upload(f.name, f, {
          access: 'public',
          // сюда ходит upload() за токеном -> наш серверный роут вернёт токен и выполнит onUploadCompleted
          handleUploadUrl: '/api/admin/upload',
          onUploadProgress: (p) => {
            // p.percentage: 0..100
            setProgress(Math.round(p.percentage || 0));
          },
        });
      }

      await loadPhotos();
      setFiles([]);
      setProgress(0);
      alert('Готово! Файлы загружены.');
    } catch (e) {
      console.error(e);
      setError(e?.message || String(e));
      alert('Ошибка загрузки: ' + (e?.message || String(e)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Админ • Галерея</h1>
      <p className="text-sm opacity-75 mb-4">
        Загрузите одно или несколько фото — они сохранятся в Blob и появятся ниже.
      </p>

      <div className="rounded-xl bg-neutral-900/30 border border-neutral-800 p-4 mb-6">
        <input type="file" multiple accept="image/*" onChange={onChange} />
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={onUpload}
            disabled={!files.length || busy}
            className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/15 disabled:opacity-50"
          >
            Загрузить
          </button>
          {busy ? <span>Загрузка… {progress}%</span> : null}
          {error ? <span className="text-red-400">Ошибка: {error}</span> : null}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((p) => (
          <a
            key={p.id}
            href={p.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-lg overflow-hidden border border-neutral-800 hover:border-neutral-700"
          >
            {/* отрисуем как превью <img>, blob-URL публичный */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="" className="w-full h-40 object-cover" />
          </a>
        ))}
        {!photos.length && <div className="opacity-60">Пока нет фото.</div>}
      </div>
    </div>
  );
}
