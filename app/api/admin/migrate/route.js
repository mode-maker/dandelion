// app/api/admin/migrate/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // На всякий случай создаём таблицу
    await sql/* sql */`
      CREATE TABLE IF NOT EXISTS photos (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        width INT,
        height INT,
        title TEXT,
        tags TEXT[],
        published BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    // Добавляем колонку, если её нет
    await sql/* sql */`ALTER TABLE photos ADD COLUMN IF NOT EXISTS sort_index INT DEFAULT 0`;

    // Бэкофилл: если sort_index = 0 или NULL — проставим по порядку id
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

    return NextResponse.json({ ok: true, msg: 'Migration applied' });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
