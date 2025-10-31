// app/api/admin/migrate/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
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

    // photos (+ album_id)
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

    // бэкофилл sort_index
    await sql/* sql */`
      UPDATE albums a SET sort_index = sub.rn
      FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY id) rn FROM albums) sub
      WHERE a.id = sub.id AND COALESCE(a.sort_index,0)=0
    `;
    await sql/* sql */`
      UPDATE photos p SET sort_index = sub.rn
      FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY id) rn FROM photos) sub
      WHERE p.id = sub.id AND COALESCE(p.sort_index,0)=0
    `;

    return NextResponse.json({ ok: true, msg: 'Albums + album_id migration applied' });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
