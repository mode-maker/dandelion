'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

function Card({ album, onDelete }) {
  const thumbs = Array.isArray(album.preview) ? album.preview.slice(0, 3) : [];
  return (
    <div className="bg-[#111a14] border border-[#2a3a31] rounded-xl p-4 flex flex-col gap-3">
      <div className="flex gap-2">
        {thumbs.length ? thumbs.map(t => (
          <img key={t.id} src={t.url} alt="" className="w-16 h-16 object-cover rounded-md" />
        )) : <div className="text-sm text-gray-400">нет превью</div>}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <div className="font-medium">{album.title}</div>
          <div className="text-gray-400">Фото: {album.photo_count}</div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/albums/${album.id}`} className="px-3 py-1 rounded-md bg-[#264332] hover:bg-[#2e523e] text-sm">
            Открыть
          </Link>
          <button onClick={() => onDelete(album.id)} className="px-3 py-1 rounded-md bg-[#4a1f1f] hover:bg-[#5a2424] text-sm">
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AlbumsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await fetch('/api/admin/albums', { cache: 'no-store' });
    const j = await r.json();
    setItems(j.items || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createAlbum() {
    const title = prompt('Название альбома');
    if (!title) return;
    await fetch('/api/admin/albums', { method: 'POST', body: JSON.stringify({ title }) });
    await load();
  }

  async function deleteAlbum(id) {
    if (!confirm('Удалить альбом и все фото?')) return;
    await fetch('/api/admin/albums', { method: 'DELETE', body: JSON.stringify({ id }) });
    await load();
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Альбомы</h1>
        <button onClick={createAlbum} className="px-4 py-2 rounded-lg bg-[#264332] hover:bg-[#2e523e]">
          Создать альбом
        </button>
      </div>

      {loading ? <div className="opacity-70">Загрузка…</div> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map(a => <Card key={a.id} album={a} onDelete={deleteAlbum} />)}
        </div>
      )}
    </div>
  );
}
