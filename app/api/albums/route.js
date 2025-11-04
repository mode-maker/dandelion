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

export async function GET(req) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(req.url);
    const withPhotos = searchParams.get('withPhotos') === '1'; // для обратной совместимости

    if (withPhotos) {
      // старый режим, если где-то нужен: вернуть альбомы + фото (не рекомендуется)
      const albums = (await sql/* sql */`
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
      `).rows;

      const result = [];
      for (const a of albums) {
        const photos = (await sql/* sql */`
          SELECT id, url, width, height, sort_index
          FROM photos
          WHERE album_id = ${a.id} AND published = TRUE
          ORDER BY sort_index, id
        `).rows;
        result.push({ ...a, photos });
      }
      return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
    }

    // новый режим: только мета (обложка + count)
    const rows = (await sql/* sql */`
      SELECT
        a.id, a.title, a.event_date, a.published, a.sort_index,
        COALESCE((
          SELECT url FROM photos
          WHERE album_id = a.id AND published = TRUE
          ORDER BY sort_index, id
          LIMIT 1
        ), NULL) AS cover_url,
        COALESCE((
          SELECT COUNT(*) FROM photos
          WHERE album_id = a.id AND published = TRUE
        ), 0)::int AS photo_count
      FROM albums a
      WHERE a.published = TRUE
      ORDER BY a.sort_index, a.id
    `).rows;

    return NextResponse.json(rows, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
