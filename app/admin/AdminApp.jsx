// app/admin/AdminApp.jsx
'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { handleUpload } from '@vercel/blob/client';

export default function AdminApp() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0); // 0..100
  const [error, setError] = useState('');
  const [uploaded, setUploaded] = useState([]); // [{url, pathname, size, contentType}]

  const inputRef = useRef(null);

  const onPickClick = () => inputRef.current?.click();

  const onFilesChosen = useCallback((fileList) => {
    setError('');
    const arr = Array.from(fileList || []).filter((f) =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    );
    setFiles(arr);
    setUploaded([]);
    setProgress(0);
  }, []);

  const onInputChange = (e) => onFilesChosen(e.target.files);

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFilesChosen(e.dataTransfer.files);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const totalSize = useMemo(
    () => files.reduce((acc, f) => acc + (f?.size || 0), 0),
    [files]
  );

  const pretty = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let v = bytes;
    while (v >= 1024 && i < units.length - 1) {
      v /= 1024;
      i++;
    }
    return `${v.toFixed(1)} ${units[i]}`;
  };

  const doUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    setError('');
    setProgress(0);
    setUploaded([]);

    try {
      // handleUpload самостоятельно отправит POST на наш API-роут
      // ВАЖНО: endpoint строго '/api/admin/upload'
      const { uploaded } = await handleUpload(files, {
        endpoint: '/api/admin/upload',
        // маленький "визуальный" прогресс: считаем долю обработанных файлов
        onUploadProgress({ uploaded: done, total }) {
          // иногда total может быть undefined — страхуемся
          if (typeof total === 'number' && total > 0) {
            setProgress(Math.round((done / total) * 100));
          }
        },
      });

      setUploaded(uploaded || []);
      setProgress(100);
      setFiles([]); // очистим выбранные файлы после успеха
    } catch (e) {
      console.error(e);
      setError(
        e?.message ||
          'Ошибка загрузки. Проверь токен, endpoint и типы файлов (jpeg/png/webp).'
      );
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Админ: Загрузка фотографий
        </h1>
        <p className="mt-2 text-neutral-400">
          Разрешены: <span className="font-mono">JPEG, PNG, WEBP</span>.
          Файлы отправляются в <span className="font-mono">/api/admin/upload</span> и сохраняются в Vercel Blob.
        </p>

        {/* Выбор файлов */}
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          className="mt-6 rounded-2xl border border-dashed border-neutral-700 p-8 text-center hover:border-neutral-500 transition-colors"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={onInputChange}
          />
          <button
            onClick={onPickClick}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 transition"
            disabled={uploading}
          >
            Выбрать файлы
          </button>
          <div className="mt-3 text-neutral-400">
            или перетащи файлы сюда
          </div>

          {!!files.length && (
            <div className="mt-5 text-left">
              <div className="text-sm text-neutral-400 mb-2">
                Выбрано: {files.length} • Общий размер: {pretty(totalSize)}
              </div>
              <ul className="space-y-1 text-sm">
                {files.map((f) => (
                  <li key={f.name} className="truncate">
                    {f.name} <span className="text-neutral-500">({pretty(f.size)})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3 justify-center">
            <button
              onClick={doUpload}
              disabled={!files.length || uploading}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {uploading ? 'Загрузка…' : 'Загрузить'}
            </button>
            {uploading && (
              <div className="text-sm text-neutral-400">
                Прогресс: {progress}%
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Результаты загрузки */}
        {!!uploaded.length && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold">Загружено:</h2>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {uploaded.map((u) => (
                <figure
                  key={u.url}
                  className="rounded-xl overflow-hidden border border-neutral-800"
                  title={u.pathname}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={u.url}
                    alt={u.pathname}
                    className="w-full h-40 object-cover"
                  />
                  <figcaption className="p-2 text-xs text-neutral-400 break-all">
                    {u.pathname}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}

        {/* Подсказка для отладки */}
        <div className="mt-10 text-xs text-neutral-500">
          Если появится ошибка <span className="font-mono">"No token found"</span>, проверь:
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>
              На сервере доступна переменная{' '}
              <span className="font-mono">BLOB_READ_WRITE_TOKEN</span> (роут{' '}
              <span className="font-mono">/api/admin/ping</span> должен показывать <span className="font-mono">hasBlobToken: true</span>).
            </li>
            <li>
              Этот компонент вызывает{' '}
              <span className="font-mono">handleUpload(..., &#123; endpoint: '/api/admin/upload' &#125;)</span>.
            </li>
            <li>
              Серверный роут работает в Node.js и помечен{' '}
              <span className="font-mono">export const runtime = 'nodejs'</span> и{' '}
              <span className="font-mono">export const dynamic = 'force-dynamic'</span>.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
