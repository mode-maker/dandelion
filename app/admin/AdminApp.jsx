'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const theme = {
  card: 'rounded-2xl bg-[color:var(--bg-1)] shadow-lg shadow-black/20 ring-1 ring-white/5',
  sectionTitle: 'text-[color:var(--aurora-3)] tracking-wide text-sm uppercase',
  h1: 'text-2xl md:text-3xl font-semibold text-[color:var(--aurora-3)]',
  muted: 'text-[color:var(--aurora-3)]/80',
  btn: 'px-5 py-2 rounded-xl bg-[#556B5A] hover:bg-[#5e7569] transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  ghost: 'px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors',
  chipOn: 'text-xs px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-300/20',
  chipOff:'text-xs px-2 py-0.5 rounded-md bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-300/20',
};

// ————— локальные превью выбранных файлов —————
function FilePreviewGrid({ files, onRemove }) {
  if (!files?.length) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {files.map((f, i) => {
        const url = URL.createObjectURL(f);
        return (
          <div key={i} className={`relative overflow-hidden ${theme.card}`}>
            <img src={url} alt={f.name} className="block w-full h-40 object-cover select-none" onLoad={() => URL.revokeObjectURL(url)} />
            <div className="absolute bottom-0 inset-x-0 p-2 bg-black/30 backdrop-blur-sm text-xs text-white/90 whitespace-nowrap overflow-hidden text-ellipsis">
              {f.name}
            </div>
            {!!onRemove && (
              <button onClick={() => onRemove(i)} className="absolute top-2 right-2 text-xs px-2 py-1 rounded-md bg-black/40 hover:bg-black/60 text-white">
                Удалить
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ————— карточка уже загруженного фото —————
function ExistingCard({ item, onToggle, onDelete, onMoveUp, onMoveDown }) {
  return (
    <div className={`overflow-hidden ${theme.card}`}>
      <img src={item.url} alt={`photo-${item.id}`} className="block w-full h-40 object-cover" loading="lazy" />
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="text-white/85 text-xs">#{item.id}</span>
        <span className={item.published ? theme.chipOn : theme.chipOff}>
          {item.published ? 'Публикуется' : 'Скрыто'}
        </span>
      </div>
      <div className="px-3 pb-3 flex items-center gap-2">
        <button onClick={() => onMoveUp(item)} className={theme.ghost} title="Вверх">↑</button>
        <button onClick={() => onMoveDown(item)} className={theme.ghost} title="Вниз">↓</button>
        <button onClick={() => onToggle(item)} className={theme.ghost}>
          {item.published ? 'Скрыть' : 'Опубликовать'}
        </button>
        <button onClick={() => onDelete(item)} className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300">
          Удалить
        </button>
      </div>
    </div>
  );
}

export default function AdminApp() {
  // загрузка
  const [queue, setQueue] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');

  // существующие
  const [items, setItems] = useState([]);
  const [dirtyOrder, setDirtyOrder] = useState(false); // порядок менялся

  const inputRef = useRef(null);

  async function fetchExisting() {
    setError('');
    try {
      const res = await fetch('/api/admin/photos', { cache: 'no-store' });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
      setDirtyOrder(false);
    } catch (e) {
      setError(e.message || 'Ошибка загрузки списка фотографий');
    }
  }

  useEffect(() => { fetchExisting(); }, []);

  // ——— очередь на загрузку ———
  function onFilesChosen(list) {
    setError('');
    setOkMsg('');
    const arr = Array.from(list || []);
    const onlyImages = arr.filter((f) => f.type.startsWith('image/'));
    if (onlyImages.length !== arr.length) {
      setError('Некоторые файлы не изображений — пропущены.');
    }
    setQueue((prev) => [...prev, ...onlyImages]);
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

      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
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

  // ——— операции над существующими ———
  function swap(aIdx, bIdx) {
    setItems((prev) => {
      const arr = prev.slice();
      [arr[aIdx], arr[bIdx]] = [arr[bIdx], arr[aIdx]];
      return arr;
    });
    setDirtyOrder(true);
  }
  function moveUp(item) {
    const i = items.findIndex((x) => x.id === item.id);
    if (i > 0) swap(i, i - 1);
  }
  function moveDown(item) {
    const i = items.findIndex((x) => x.id === item.id);
    if (i < items.length - 1) swap(i, i + 1);
  }
  async function saveOrder() {
    const ids = items.map((x) => x.id);
    const res = await fetch('/api/admin/photos/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (res.ok) { setDirtyOrder(false); } else {
      const j = await res.json().catch(() => ({}));
      setError(j?.error || 'Не удалось сохранить порядок');
    }
    await fetchExisting();
  }
  async function togglePublish(item) {
    const res = await fetch(`/api/admin/photos/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !item.published }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error || 'Ошибка переключения статуса');
    }
    await fetchExisting();
  }
  async function remove(item) {
    const ok = confirm('Удалить фото? Это действие необратимо.');
    if (!ok) return;
    const res = await fetch(`/api/admin/photos/${item.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error || 'Ошибка удаления');
    }
    await fetchExisting();
  }

  const queueSizeMb = useMemo(
    () => (queue.reduce((a, f) => a + (f.size || 0), 0) / (1024 * 1024)).toFixed(1),
    [queue]
  );

  return (
    <div className="min-h-screen bg-[color:var(--bg-0)]">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        <header className="mb-8 md:mb-10 text-center">
          <h1 className={theme.h1}>Админ-панель · Галерея</h1>
          <p className={`${theme.muted} mt-2`}>Загрузка, публикация, порядок, удаление.</p>
        </header>

        {/* === СЕЙЧАС ЗАГРУЖАЕМ === */}
        <section className={`mb-10 p-5 md:p-6 ${theme.card}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={theme.sectionTitle}>СЕЙЧАС ЗАГРУЖАЕМ</h2>
            {queue.length > 0 && <span className="text-xs text-white/70">{queueSizeMb} MB</span>}
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onFilesChosen(e.dataTransfer?.files); }}
            className="relative border border-white/10 rounded-2xl p-6 md:p-8 text-center hover:border-white/20 transition-colors"
          >
            <p className="text-white/90">Перетащи сюда изображения</p>
            <p className="text-white/70 text-sm">или выбери файл(ы) вручную</p>
            <div className="mt-3">
              <input ref={inputRef} onChange={(e) => onFilesChosen(e.target.files)} type="file" accept="image/*" multiple className="hidden" id="pick-files" />
              <label htmlFor="pick-files" className={`${theme.btn} inline-block cursor-pointer`}>Выбрать файлы</label>
            </div>
          </div>

          <div className="mt-6">
            <FilePreviewGrid files={queue} onRemove={(i) => setQueue((prev) => prev.filter((_, idx) => idx !== i))} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button onClick={doUpload} disabled={!queue.length || uploading} className={theme.btn}>
              {uploading ? 'Загрузка…' : 'Загрузить'}
            </button>
            <button onClick={clearQueue} disabled={!queue.length || uploading} className={theme.ghost}>
              Очистить очередь
            </button>
          </div>

          {okMsg && <div className="mt-3 text-sm text-emerald-400">{okMsg}</div>}
          {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
        </section>

        {/* === УЖЕ НА САЙТЕ === */}
        <section className={`p-5 md:p-6 ${theme.card}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={theme.sectionTitle}>УЖЕ НА САЙТЕ</h2>
            <div className="flex gap-2">
              <button onClick={fetchExisting} className={theme.ghost}>Обновить</button>
              <button onClick={saveOrder} disabled={!dirtyOrder} className={`${dirtyOrder ? theme.btn : 'px-5 py-2 rounded-xl bg-white/10 text-white/60'}`}>
                Сохранить порядок
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {items.map((it) => (
              <ExistingCard
                key={it.id}
                item={it}
                onToggle={togglePublish}
                onDelete={remove}
                onMoveUp={moveUp}
                onMoveDown={moveDown}
              />
            ))}
          </div>

          <p className="text-[color:var(--aurora-3)]/70 mt-4 text-xs">
            Порядок меняется кнопками ↑/↓. Нажми «Сохранить порядок», чтобы применить на сайте.
          </p>
        </section>
      </div>
    </div>
  );
}
