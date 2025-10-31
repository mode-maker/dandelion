// app/api/admin/upload/route.js
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) return NextResponse.json({ error: 'Missing BLOB_READ_WRITE_TOKEN on server' }, { status: 500 });

    const form = await request.formData();
    const files = form.getAll('files').filter(Boolean);
    const albumId = Number(form.get('albumId')) || null;
    if (!files.length) return NextResponse.json({ error: 'Нет файлов' }, { status: 400 });
    if (!albumId) return NextResponse.json({ error: 'albumId required' }, { status: 400 });

    // позиция в альбоме
    const { rows: maxr } = await sql/* sql */`
      SELECT COALESCE(MAX(sort_index),0) AS max_pos FROM photos WHERE album_id = ${albumId}
    `;
    let pos = Number(maxr?.[0]?.max_pos || 0);

    const uploaded = [];
    for (const file of files) {
      const fileName = (file.name || `photo-${Date.now()}`).replace(/\s+/g, '_');
      const blob = await put(fileName, file, { access: 'public', token, contentType: file.type || 'application/octet-stream' });
      pos += 1;
      const { rows } = await sql/* sql */`
        INSERT INTO photos (album_id, url, published, sort_index)
        VALUES (${albumId}, ${blob.url}, TRUE, ${pos})
        RETURNING id, album_id, url, published, sort_index, created_at
      `;
      uploaded.push(rows[0]);
    }

    revalidatePath('/albums');
    revalidatePath(`/albums/${albumId}`);
    return NextResponse.json({ ok: true, uploaded });
  } catch (e) {
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ hint: 'Use POST to upload files' }, { status: 405 });
}
