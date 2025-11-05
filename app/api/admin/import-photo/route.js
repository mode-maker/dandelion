// app/api/admin/import-photo/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Теги убраны: пишем только базовые поля
export async function POST(req) {
  try {
    const { albumId, url, width, height, title } = await req.json().catch(() => ({}));
    if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });

    await sql/* sql */`
      INSERT INTO photos (album_id, url, width, height, title, published, created_at)
      VALUES (
        ${albumId ? Number(albumId) : null},
        ${url},
        ${width ?? null},
        ${height ?? null},
        ${title ?? null},
        TRUE,
        NOW()
      );
    `;

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('POST /api/admin/import-photo failed:', e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
