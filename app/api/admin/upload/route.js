// app/api/admin/upload/route.js
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { sql } from '@vercel/postgres';
import { revalidatePath, revalidateTag } from 'next/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) return NextResponse.json({ error: 'Missing BLOB_READ_WRITE_TOKEN on server' }, { status: 500 });

    const form = await request.formData();
    const files = form.getAll('files').filter(Boolean);
    if (!files.length) return NextResponse.json({ error: 'Нет файлов для загрузки' }, { status: 400 });

    await sql/* sql */`
      CREATE TABLE IF NOT EXISTS photos (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        width INT,
        height INT,
        title TEXT,
        tags TEXT[],
        published BOOLEAN DEFAULT TRUE,
        sort_index INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    const { rows: maxRow } = await sql/* sql */`SELECT COALESCE(MAX(sort_index), 0) AS max_pos FROM photos`;
    let pos = Number(maxRow?.[0]?.max_pos || 0);

    const uploaded = [];
    for (const file of files) {
      const fileName = (file.name || `photo-${Date.now()}`).replace(/\s+/g, '_');
      const blob = await put(fileName, file, { access: 'public', token, contentType: file.type || 'application/octet-stream' });
      pos += 1;

      const { rows } = await sql/* sql */`
        INSERT INTO photos (url, published, sort_index)
        VALUES (${blob.url}, TRUE, ${pos})
        RETURNING id, url, published, sort_index, created_at
      `;
      uploaded.push(rows[0]);
    }

    revalidatePath('/');
    revalidatePath('/gallery');
    revalidateTag('gallery');

    return NextResponse.json({ ok: true, uploaded });
  } catch (e) {
    console.error('upload route error:', e);
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ hint: 'Use POST to upload files' }, { status: 405 });
}
