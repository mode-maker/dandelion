import { sql } from '@vercel/postgres';

export async function POST() {
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
  return Response.json({ ok: true });
}
