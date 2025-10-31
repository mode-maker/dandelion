// app/api/admin/albums/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';

async function ensureSchema() {
  // albums
  await sql/* sql */`
    CREATE TABLE IF NOT EXISTS albums (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      event_date DATE,
      published BOOLEAN DEFAULT TRUE,
      sort_index INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  // photos (если ещё не было) — с привязкой к альбому
  await sql/* sql */`
    CREATE TABLE IF NOT EXISTS photos (
      id SERIAL PRIMARY KEY,
      album_id INT REFERENCES albums(id) ON DELETE CASCADE,
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
}

export async function GET() {
  try {
    await ensureSchema();

    const { rows } = await sql/* sql */`
      SELECT
        a.id, a.title, a.event_date, a.published, a.sort_index, a.created_at,
        (
          SELECT url FROM photos
          WHERE album_id = a.id AND published = TRUE
          ORDER BY sort_index, id
          LIMIT 1
        ) AS cover_url,
        (
          SELECT COUNT(*)::INT FROM photos
          WHERE album_id = a.id AND published = TRUE
        ) AS published_count
      FROM albums a
      ORDER BY a.sort_index, a.id
    `;
    return NextResponse.json(rows, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await ensureSchema();

    const body = await request.json().catch(() => ({}));
    const title = String(body?.title || '').trim();
    const event_date = body?.event_date ? new Date(body.event_date) : null;
    if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 });

    const { rows: maxr } = await sql/* sql */`
      SELECT COALESCE(MAX(sort_index),0) AS max_pos FROM albums
    `;
    const pos = Number(maxr?.[0]?.max_pos || 0) + 1;

    const { rows } = await sql/* sql */`
      INSERT INTO albums (title, event_date, published, sort_index)
      VALUES (${title}, ${event_date}, TRUE, ${pos})
      RETURNING id, title, event_date, published, sort_index, created_at
    `;

    revalidatePath('/albums');
    return NextResponse.json(rows[0]);
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
