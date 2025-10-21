import { sql } from '@vercel/postgres';

export async function POST() {
  await sql/* sql */`
    ALTER TABLE IF EXISTS photos
      ADD COLUMN IF NOT EXISTS sort_order INT,
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS author TEXT,
      ADD COLUMN IF NOT EXISTS location TEXT,
      ADD COLUMN IF NOT EXISTS shooted_at DATE,
      ADD COLUMN IF NOT EXISTS thumb_url TEXT,
      ADD COLUMN IF NOT EXISTS thumb_width INT,
      ADD COLUMN IF NOT EXISTS thumb_height INT;

    UPDATE photos SET sort_order = EXTRACT(EPOCH FROM created_at)::INT
      WHERE sort_order IS NULL;

    CREATE INDEX IF NOT EXISTS photos_sort_idx ON photos(sort_order DESC);
    CREATE INDEX IF NOT EXISTS photos_shooted_idx ON photos(shooted_at);
  `;
  return Response.json({ ok: true });
}
