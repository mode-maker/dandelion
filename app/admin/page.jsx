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
          // диагностический лог
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
'use client';

// запрет статической генерации и кэширования
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
