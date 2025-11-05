// app/api/admin/albums/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS albums (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`ALTER TABLE photos ADD COLUMN IF NOT EXISTS sort_index INT NOT NULL DEFAULT 0;`;
}

export async function GET() {
  try {
    await ensureSchema();
    const res = await sql`
      SELECT a.id, a.title, a.created_at,
             COUNT(p.id)::int AS photos_count
        FROM albums a
        LEFT JOIN photos p ON p.album_id = a.id
       GROUP BY a.id
       ORDER BY a.created_at DESC, a.id DESC;
    `;
    return NextResponse.json({ items: res.rows });
  } catch (e) {
    console.error('GET /api/admin/albums failed:', e);
    return NextResponse.json({ error: e.message || 'internal error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await ensureSchema();
    const body = await req.json().catch(() => ({}));
    const title = (body?.title || '').trim();
    if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 });
    const ins = await sql`
      INSERT INTO albums (title) VALUES (${title})
      RETURNING id, title, created_at;
    `;
    return NextResponse.json({ album: ins.rows[0] });
  } catch (e) {
    console.error('POST /api/admin/albums failed:', e);
    return NextResponse.json({ error: e.message || 'internal error' }, { status: 500 });
  }
}
