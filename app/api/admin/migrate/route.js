import { sql } from '@vercel/postgres';

export async function POST() {
  // 1) базовая таблица (на случай, если init не вызывали)
  await sql/* sql */`
    CREATE TABLE IF NOT EXISTS photos (
      id SERIAL PRIMARY KEY,
      url TEXT,
      width INT,
      height INT,
      title TEXT,
      tags TEXT[],
      published BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // 2) расширение колонками
  await sql/* sql */`
    ALTER TABLE photos
      ADD COLUMN IF NOT EXISTS sort_order INT,
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS author TEXT,
      ADD COLUMN IF NOT EXISTS location TEXT,
      ADD COLUMN IF NOT EXISTS shooted_at DATE,
      ADD COLUMN IF NOT EXISTS thumb_url TEXT,
      ADD COLUMN IF NOT EXISTS thumb_width INT,
      ADD COLUMN IF NOT EXISTS thumb_height INT;
  `;

  // 3) sort_order, если пусто
  await sql/* sql */`
    UPDATE photos
    SET sort_order = EXTRACT(EPOCH FROM created_at)::INT
    WHERE sort_order IS NULL;
  `;

  // 4) индексы
  await sql/* sql */`
    CREATE INDEX IF NOT EXISTS photos_sort_idx ON photos(sort_order DESC);
    CREATE INDEX IF NOT EXISTS photos_shooted_idx ON photos(shooted_at);
  `;

  return Response.json({ ok: true });
}
