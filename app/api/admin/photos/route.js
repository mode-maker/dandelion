// app/api/admin/photos/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

async function ensureSchema() {
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
  // На случай старых записей без sort_index — проставим по id
  await sql/* sql */`
    UPDATE photos p
    SET sort_index = sub.rn
    FROM (
      SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
      FROM photos
    ) sub
    WHERE p.id = sub.id AND (p.sort_index IS NULL OR p.sort_index = 0)
  `;
}

export async function GET(request) {
  try {
    await ensureSchema();

    const { searchParams } = new URL(request.url);
    const onlyPublished = searchParams.get('published') === 'true';

    const query = onlyPublished
      ? sql`SELECT id, url, published, sort_index, created_at FROM photos WHERE published = TRUE ORDER BY sort_index ASC, id ASC`
      : sql`SELECT id, url, published, sort_index, created_at FROM photos ORDER BY sort_index ASC, id ASC`;

    const { rows } = await query;

    return new NextResponse(JSON.stringify(rows), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        'Surrogate-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('PHOTOS LIST ERROR:', err);
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
