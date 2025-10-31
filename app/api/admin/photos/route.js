// app/api/admin/photos/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// на всякий случай создадим схему/колонки
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
  await sql/* sql */`ALTER TABLE photos ADD COLUMN IF NOT EXISTS album_id INT REFERENCES albums(id) ON DELETE CASCADE`;
  await sql/* sql */`ALTER TABLE photos ADD COLUMN IF NOT EXISTS sort_index INT DEFAULT 0`;
}

export async function GET(request) {
  try {
    await ensureSchema();

    const { searchParams } = new URL(request.url);
    const albumId = Number(searchParams.get('albumId')) || null;
    const includeHidden = searchParams.get('includeHidden') === '1';

    if (!albumId) {
      return NextResponse.json({ error: 'albumId required' }, { status: 400 });
    }

    const rows = (
      await sql/* sql */`
        SELECT id, album_id, url, published, sort_index, created_at
        FROM photos
        WHERE album_id = ${albumId}
          ${includeHidden ? sql`` : sql`AND published = TRUE`}
        ORDER BY sort_index, id
      `
    ).rows;

    // добавим порядковый номер внутри альбома
    const data = rows.map((r, i) => ({ ...r, ordinal: i + 1 }));
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
