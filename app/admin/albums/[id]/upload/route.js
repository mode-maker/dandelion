// Загрузка фото в альбом: POST /api/admin/albums/:id/upload
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { put as blobPut } from '@vercel/blob';

function extFromName(name = '') {
  const m = String(name).match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : 'bin';
}

export async function POST(req, { params }) {
  try {
    const albumId = Number(params?.id);
    if (!albumId) {
      return NextResponse.json({ error: 'albumId required' }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get('file');
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'file required' }, { status: 400 });
    }

    // Имя и загрузка в Vercel Blob
    const ext = extFromName(file.name || '');
    const objectName = `albums/${albumId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const uploaded = await blobPut(objectName, file, {
      access: 'public',
      addRandomSuffix: false,
      contentType: file.type || 'application/octet-stream',
    });

    const url = uploaded?.url;
    if (!url) {
      return NextResponse.json({ error: 'blob upload failed' }, { status: 500 });
    }

    // Вставка записи в БД
    // sort_index = следующий по порядку
    const insert = await sql`
      INSERT INTO photos (album_id, url, title, published, sort_index)
      VALUES (
        ${albumId},
        ${url},
        ${''},
        ${true},
        COALESCE((SELECT MAX(sort_index)+1 FROM photos WHERE album_id = ${albumId}), 0)
      )
      RETURNING id, album_id, url, width, height, title, published, sort_index, created_at
    `;

    const item = insert.rows?.[0];
    return NextResponse.json({ ok: true, item }, { status: 200 });
  } catch (e) {
    console.error('POST /api/admin/albums/[id]/upload error:', e);
    return NextResponse.json({ error: e?.message || 'internal error' }, { status: 500 });
  }
}
