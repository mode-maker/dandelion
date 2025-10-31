// app/api/albums/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    const { rows } = await sql/* sql */`
      SELECT
        a.id, a.title, a.event_date, a.sort_index, a.created_at,
        (SELECT url FROM photos WHERE album_id = a.id AND published = TRUE ORDER BY sort_index, id LIMIT 1) AS cover_url,
        (SELECT COUNT(*)::INT FROM photos WHERE album_id = a.id AND published = TRUE) AS count
      FROM albums a
      WHERE a.published = TRUE
      ORDER BY a.sort_index, a.id
    `;
    return NextResponse.json(rows, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
