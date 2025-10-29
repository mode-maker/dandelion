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
  await sql/* sql */`ALTER TABLE photos ADD COLUMN IF NOT EXISTS sort_index INT DEFAULT 0`;
  // Бэкофилл sort_index для старых записей
  await sql/* sql */`
    WITH ordered AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
      FROM photos
    )
    UPDATE photos p
    SET sort_index = o.rn
    FROM ordered o
    WHERE p.id = o.id AND (p.sort_index IS NULL OR p.sort_index = 0)
  `;
}

export async function GET(request) {
  try {
    await ensureSchema();

    const { searchParams } = new URL(request.url);
    const onlyPublished = searchParams.get('published') === 'true';

    // ВОТ ЗДЕСЬ: добавляем ordinal = row_number() по текущему порядку
    const query = onlyPublished
      ? sql/* sql */`
          SELECT
            id,
            url,
            published,
            sort_index,
            created_at,
            ROW_NUMBER() OVER (ORDER BY sort_index ASC, id ASC) AS ordinal
          FROM photos
          WHERE published = TRUE
          ORDER BY sort_index ASC, id ASC
        `
      : sql/* sql */`
          SELECT
            id,
            url,
            published,
            sort_index,
            created_at,
            ROW_NUMBER() OVER (ORDER BY sort_index ASC, id ASC) AS ordinal
          FROM photos
          ORDER BY sort_index ASC, id ASC
        `;

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
