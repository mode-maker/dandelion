// app/api/admin/upload/route.js
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: 'Missing BLOB_READ_WRITE_TOKEN on server' },
        { status: 500 }
      );
    }

    const form = await request.formData();
    const files = form.getAll('files').filter(Boolean);
    if (!files.length) {
      return NextResponse.json({ error: 'Нет файлов для загрузки' }, { status: 400 });
    }

    // гарантируем, что таблица есть
    await sql/* sql */`
      CREATE TABLE IF NOT EXISTS photos (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        width INT,
        height INT,
        title TEXT,
        tags TEXT[],
        published BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    const uploaded = [];

    for (const file of files) {
      // file — это Blob из FormData
      const fileName = (file.name || `photo-${Date.now()}`).replace(/\s+/g, '_');
      const blob = await put(fileName, file, {
        access: 'public',
        token,
        contentType: file.type || 'application/octet-stream',
      });

      const { rows } = await sql/* sql */`
        INSERT INTO photos (url, published)
        VALUES (${blob.url}, TRUE)
        RETURNING id, url, published, created_at
      `;
      uploaded.push(rows[0]);
    }

    return NextResponse.json({ ok: true, uploaded });
  } catch (e) {
    console.error('upload route error:', e);
    return NextResponse.json(
      { error: e?.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { hint: 'Use POST to upload files' },
    { status: 405 }
  );
}
