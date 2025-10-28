'use client';

import { useState, useRef } from 'react';

export default function AdminApp() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const onFilesChosen = (list) => {
    setFiles(Array.from(list));
    setError('');
  };

  async function doUpload() {
    if (!files.length) return;
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      for (const f of files) formData.append('files', f);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      console.log('upload result', data);

      if (!res.ok) throw new Error(data.error || 'Ошибка загрузки');
      alert('✅ Загрузка успешна!');
      setFiles([]);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-10">
      <h1 className="text-2xl font-bold
