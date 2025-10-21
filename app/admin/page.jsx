'use client';

// запрет статической генерации и кэширования
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { useEffect, useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';

export default function AdminHome() {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const [list, setList] = useState([]);

  async function load() {
    const r = await fetch('/api/admin/photos', { cache: 'no-store' });
    setList(await r.json());
  }
  useEffect(() => { load(); }, []);

  async function onUpload(e) {
    e.preventDefault();
    if (!inputRef.current?.files?.length) return;
    setBusy(true);

    const files = Array.from(inputRef.current.files);

    try {
      for (const file of files) {
        await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/admin/upload',
          onUploadProgress: (p) => {
            const pct = p?.percentage ? Math.floor(p.percentage) : null;
            setProgress(pct);
            if (pct !== null) console.log('progress', pct, '%');
          }
        });
      }
    } catch (err) {
      console.error('upload error:', err);
      alert('Ошибка загрузки: ' + (err?.message || err));
    } finally {
      setBusy(false);
      setProgress(null);
      inputRef.current.value = '';
      await load(); // обновим список
    }
  }

  return (
    <div style={{ minHeight: '100vh', background:'#070b14', color:'#E7E8E0', padding:'40px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Админ · Галерея</h1>
      <p style={{ opacity: 0.8, marginTop: 10 }}>
        Загрузите одно или несколько фото — они сохранятся в Blob и появятся ниже.
      </p>

      <form onSubmit={onUpload} style={{ marginTop: 16, padding: 16, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
        <input ref={inputRef} type="file" accept="image/*" multiple
          style={{ background:'rgba(255,255,255,0.1)', padding:8, borderRadius:12, width:'100%' }}/>
        <button disabled={busy} style={{ marginTop:12, padding:'8px 16px', borderRadius:12, background:'rgba(255,255,255,0.1)' }}>
          {busy ? `Загрузка… ${progress ?? ''}%` : 'Загрузить'}
        </button>
      </form>

      <div style={{ marginTop: 24, display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
        {list.map((p) => (
          <div key={p.id} style={{ border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, padding:12, background:'rgba(0,0,0,0.2)' }}>
            <img src={p.url} alt="" style={{ width:'100%', height:180, objectFit:'cover', borderRadius:12 }} />
            <div style={{ fontSize:12, opacity:0.75, marginTop:8 }}>id: {p.id}</div>
            <a href={p.url} target="_blank" rel="noreferrer" style={{ fontSize:12, textDecoration:'underline', opacity:0.85 }}>
              Открыть оригинал
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
