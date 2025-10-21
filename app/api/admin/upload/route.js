// app/api/admin/upload/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { sql } from '@vercel/postgres';

export async function POST(req) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'Missing env BLOB_READ_WRITE_TOKEN' },
        { status: 500 }
      );
    }

    const form = await req.formData();
    const file = form.get('file');
    const wantedName = form.get('filename');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { ok: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    const filename = wantedName || file.name || `upload_${Date.now()}`;

    const { url } = await put(`gallery/${filename}`, file, {
      access: 'public',
      token,
      addRandomSuffix: true,
      contentType: file.type || 'application/octet-stream',
    });

    // сохраняем ссылку в БД (при первом аплоаде создастся таблица)
    await sql`
      CREATE TABLE IF NOT EXISTS photos (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        published BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await sql`INSERT INTO photos (url, published) VALUES (${url}, TRUE)`;

    return NextResponse.json({ ok: true, url, filename });
  } catch (err) {
    console.error('UPLOAD ERROR:', err);
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
