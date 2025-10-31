// app/api/albums/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

async function ensureSchema() {
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

    // альбомы только опубликованные
    const albums = (
      await sql/* sql */`
        SELECT
          a.id, a.title, a.event_date, a.published, a.sort_index,
          (
            SELECT url FROM photos
            WHERE album_id = a.id AND published = TRUE
            ORDER BY sort_index, id
            LIMIT 1
          ) AS cover_url
        FROM albums a
        WHERE a.published = TRUE
        ORDER BY a.sort_index, a.id
      `
    ).rows;

    // подтянем опубликованные фото для каждого альбома
    const result = [];
    for (const a of albums) {
      const photos = (
        await sql/* sql */`
          SELECT id, url, sort_index
          FROM photos
          WHERE album_id = ${a.id} AND published = TRUE
          ORDER BY sort_index, id
        `
      ).rows;
      result.push({ ...a, photos });
    }

    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
