
/** Лёгкий фон с «частицами» под зелёную тему Dandelion */
function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-20%,#163223_50%,#0b1310_100%)]" />
      <div className="absolute inset-0 mix-blend-screen opacity-30">
        {/* «пыльца» */}
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-[2px]"
            style={{
              left: `${(i * 137) % 100}%`,
              top: `${(i * 73) % 100}%`,
              width: 6,
              height: 6,
              background: 'rgba(140, 206, 150, 0.45)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function AlbumCard({ album, onDelete, onRename }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(album.title || '');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditing) {
      setValue(album.title || '');
    }
  }, [album.title, isEditing]);

  async function submitRename() {
    const nextTitle = value.trim();
    if (!nextTitle) {
      setError('Введите название');
      return;
    }

    if (nextTitle === (album.title || '')) {
      setIsEditing(false);
      setError('');
      return;
    }

    try {
      setPending(true);
      setError('');
      await onRename(album.id, nextTitle);
      setIsEditing(false);
    } catch (e) {
      setError(e?.message || 'Не удалось сохранить');
    } finally {
      setPending(false);
    }
  }

  function cancelRename() {
    setIsEditing(false);
    setError('');
    setValue(album.title || '');
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitRename();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelRename();
    }
  }

  const date = album?.created_at ? new Date(album.created_at) : null;
  const humanDate = date
    ? date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#2a3a31] bg-white/5 p-4 shadow-[0_6px_25px_rgba(0,0,0,0.25)] backdrop-blur">
      {/* мини-превью (если есть) */}
      {Array.isArray(album.preview) && album.preview.length > 0 ? (
        <div className="grid grid-cols-4 gap-1">
          {album.preview.slice(0, 8).map((p) => (
            <div key={p.id} className="relative w-full pt-[75%] overflow-hidden rounded-xl">
              <img src={p.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#2a3a31] py-10 text-center text-sm text-gray-400">
          Нет превью
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <input
                className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm outline-none ring-2 ring-transparent transition focus:border-white/20 focus:ring-white/30"
                value={value}
                autoFocus
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Название альбома"
              />
              {error && <p className="text-xs text-rose-300">{error}</p>}
            </div>
          ) : (
            <>
              <div className="truncate text-lg font-semibold">{album.title || `Альбом #${album.id}`}</div>
              <div className="text-xs text-gray-400">
                {humanDate} • Фото: {album.photo_count ?? 0}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={submitRename}
                disabled={pending}
                className="rounded-lg bg-[#2d6d4c] px-3 py-1.5 text-sm transition hover:bg-[#36845d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? 'Сохранение…' : 'Сохранить'}
              </button>
              <button
                onClick={cancelRename}
                disabled={pending}
                className="rounded-lg bg-white/10 px-3 py-1.5 text-sm transition hover:bg-white/15 disabled:opacity-60"
              >
                Отмена
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setIsEditing(true);
                setError('');
                setValue(album.title || '');
              }}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-sm transition hover:bg-white/15"
            >
              Переименовать
            </button>
          )}
          <Link
            href={`/admin/albums/${album.id}`}
            className="rounded-lg bg-[#29523d] px-3 py-1.5 text-sm transition hover:bg-[#2f6148]"
          >
            Открыть
          </Link>
          <button
            onClick={() => onDelete(album.id)}
            className="rounded-lg bg-[#4a1f1f] px-3 py-1.5 text-sm transition hover:bg-[#5a2626]"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminAlbumsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      const r = await fetch('/api/admin/albums', { cache: 'no-store' });
      if (!r.ok) {
        throw new Error('Не удалось получить список альбомов');
      }
      const j = await r.json();
      setItems(j.items || []);
    } catch (e) {
      setError(e?.message || 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createAlbum() {
    const title = prompt('Название альбома');
    if (!title) return;
    await fetch('/api/admin/albums', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    await load();
  }

  async function deleteAlbum(id) {
    if (!confirm('Удалить альбом и все фото?')) return;
    await fetch('/api/admin/albums', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  async function renameAlbum(id, title) {
    const response = await fetch('/api/admin/albums', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title }),
    });

    if (!response.ok) {
      let message = 'Не удалось сохранить изменения';
      try {
        const data = await response.json();
        if (data?.error) message = data.error;
      } catch (e) {
        // ignore
      }
      throw new Error(message);
    }

    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, title } : item)));
  }

  return (
    <div className="relative min-h-dvh text-white">
      <BackgroundFX />

      <div className="mx-auto w-full max-w-6xl px-5 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
          <div className="min-w-0">
            <p className="text-sm uppercase tracking-[0.2em] text-white/60">Админ</p>
            <h1 className="text-3xl font-semibold leading-tight">Альбомы</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={load}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm backdrop-blur hover:bg-white/15"
            >
              Обновить
            </button>
            <button
              onClick={createAlbum}
              className="rounded-xl bg-[#2c5b43] px-4 py-2 text-sm hover:bg-[#376e54]"
            >
              Создать альбом
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-10 text-center text-sm text-white/70">
            Загрузка…
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((a) => (
              <AlbumCard key={a.id} album={a} onDelete={deleteAlbum} onRename={renameAlbum} />
            ))}
            {!items.length && (
              <div className="rounded-2xl border border-[#2a3a31] bg-white/5 p-6 text-center text-sm text-gray-400">
                Альбомов пока нет. Нажми «Создать альбом».
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
