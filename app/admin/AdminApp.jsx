// app/admin/AdminApp.jsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const theme = {
  card: 'rounded-2xl bg-[color:var(--bg-1)] shadow-lg shadow-black/20 ring-1 ring-white/5',
  sectionTitle: 'text-[color:var(--aurora-3)] tracking-wide text-sm uppercase',
  h1: 'text-2xl md:text-3xl font-semibold text-[color:var(--aurora-3)]',
  muted: 'text-[color:var(--aurora-3)]/80',
  btn: 'px-5 py-2 rounded-xl bg-[#556B5A] hover:bg-[#5e7569] transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  subtle: 'text-[color:var(--aurora-3)]/70',
};

function FilePreviewGrid({ files, onRemove }) {
  if (!files?.length) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {files.map((f, i) => {
        const url = URL.createObjectURL(f);
        return (
          <div key={i} className={`relative overflow-hidden ${theme.card}`}>
            <img
              src={url}
              alt={f.name}
              className="block w-full h-40 object-cover select-none"
              onLoad={() => URL.revokeObjectURL(url)}
            />
            <div className="absolute bottom-0 inset-x-0 p-2 bg-black/30 backdrop-blur-sm text-xs text-white/90 whitespace-nowrap overflow-hidden text-ellipsis">
              {f.name}
            </div>
            {!!onRemove && (
              <button
                onClick={() => onRemove(i)}
                className="absolute top-2 right-2 text-xs px-2 py-1 rounded-md bg-black/40 hover:bg-black/60 text-white"
                aria-label="Удалить из очереди"
              >
                Удалить
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ExistingGrid({ items }) {
  if (!items?.length) {
    return <div className={`${theme.subtle}`}>Пока нет загруженных фотографий.</div>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {items.map((p) => (
        <div key={p.id} className={`overflow-hidden ${theme.card}`}>
          <img
            src={p.url}
            alt={`photo-${p.id}`}
            className="block w-full h-40 object-cover"
            loading="lazy"
          />
          <div className="flex items-center justify-between px-3 py-2 text-xs">
            <span className="text-white/80">#{p.id}</span>
            <span className={p.published ? 'text-emerald-400' : 'text-yellow-300'}>
              {p.published ? 'Публикуется' : 'Скрыто'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminApp() {
  const [queue, setQueue] = useState([]);          // выбранные прямо сейчас
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');
  const [existing, setExisting] = useState([]);    // уже загруженные из БД
  const [reloading, setReloading] = useState(false);

  const inputRef = useRef(null);

  const queueNiceSize = useMemo(
    () =>
      queue.reduce((acc, f) => acc + (typeof f.size === 'number' ? f.size : 0), 0),
    [queue]
  );

  async function fetchExisting() {
    setReloading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/photos', { cache: 'no-store' });
      if (!res.ok) throw new Error('Не удалось получить список фото');
      const data = await res.json();
      setExisting(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Ошибка загрузки списка фотографий');
    } finally {
      setReloading(false);
    }
  }

  useEffect(() => {
    fetchExisting();
  }, []);

  function onFilesChosen(list) {
    setError('');
    setOkMsg('');
    const arr = Array.from(list || []);
    if (!arr.length) return;
    // лёгкая фильтрация по типу
    const onlyImages = arr.filter((f) => f.type.startsWith('image/'));
    if (onlyImages.length !== arr.length) {
      setError('Некоторые файлы не изображений — они пропущены.');
    }
    setQueue((prev) => [...prev, ...onlyImages]);
  }

  function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    onFilesChosen(e.dataTransfer?.files);
  }

  function removeFromQueue(idx) {
    setQueue((prev) => prev.filter((_, i) => i !== idx));
  }

  function clearQueue() {
    setQueue([]);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function doUpload() {
    if (!queue.length) return;
    setUploading(true);
    setError('');
    setOkMsg('');
    try {
      const formData = new FormData();
      for (const f of queue) formData.append('files', f);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Ошибка загрузки');

      setOkMsg(`✅ Загружено: ${Array.isArray(data.uploaded) ? data.uploaded.length : 0}`);
      clearQueue();
      await fetchExisting();
    } catch (e) {
      setError(e.message || 'Не удалось загрузить файлы');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-0)]">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        <header className="mb-8 md:mb-10 text-center">
          <h1 className={`${theme.h1}`}>Админ-панель · Галерея</h1>
          <p className={`${theme.muted} mt-2`}>
            Загрузка изображений (Vercel Blob) + отображение уже опубликованных (Postgres).
          </p>
        </header>

        {/* Секция: что грузим прямо сейчас */}
        <section className={`mb-10 p-5 md:p-6 ${theme.card}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={theme.sectionTitle}>СЕЙЧАС ЗАГРУЖАЕМ</h2>
            {queueNiceSize > 0 && (
              <span className={`${theme.subtle} text-xs`}>
                {(queueNiceSize / (1024 * 1024)).toFixed(1)} MB
              </span>
            )}
          </div>

          {/* дропзона */}
          <div
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={onDrop}
            className="relative border border-white/10 rounded-2xl p-6 md:p-8 text-center hover:border-white/20 transition-colors"
          >
            <div className="space-y-3">
              <p className="text-white/90">Перетащи сюда изображения</p>
              <p className={`${theme.subtle} text-sm`}>или выбери файл(ы) вручную</p>
              <div>
                <input
                  ref={inputRef}
                  onChange={(e) => onFilesChosen(e.target.files)}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  id="pick-files"
                />
                <label htmlFor="pick-files" className={`${theme.btn} inline-block cursor-pointer`}>
                  Выбрать файлы
                </label>
              </div>
            </div>
          </div>

          {/* локальные превью выбранных файлов */}
          <div className="mt-6">
            <FilePreviewGrid files={queue} onRemove={removeFromQueue} />
          </div>

          {/* действия */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={doUpload}
              disabled={!queue.length || uploading}
              className={theme.btn}
            >
              {uploading ? 'Загрузка…' : 'Загрузить'}
            </button>
            <button
              onClick={clearQueue}
              disabled={!queue.length || uploading}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              Очистить очередь
            </button>
          </div>

          {okMsg && <div className="mt-3 text-sm text-emerald-400">{okMsg}</div>}
          {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
        </section>

        {/* Секция: что уже загружено и отображается на сайте */}
        <section className={`p-5 md:p-6 ${theme.card}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={theme.sectionTitle}>УЖЕ НА САЙТЕ</h2>
            <button
              onClick={fetchExisting}
              disabled={reloading}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm"
            >
              {reloading ? 'Обновление…' : 'Обновить'}
            </button>
          </div>

          <ExistingGrid items={existing} />

          <p className={`${theme.subtle} mt-4 text-xs`}>
            Источник: таблица <code>photos</code> в Postgres (Neon). Новые записи добавляются при загрузке.
          </p>
        </section>
      </div>
    </div>
  );
}
