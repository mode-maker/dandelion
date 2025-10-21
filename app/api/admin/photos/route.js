// app/api/admin/photos/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS photos (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        published BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );`;

    const { rows } = await sql`SELECT id, url, published, created_at FROM photos ORDER BY id DESC`;
    return NextResponse.json(rows);
  } catch (err) {
    console.error('PHOTOS LIST ERROR:', err);
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
