// app/api/albums/[id]/photos/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(_req, { params }) {
  try {
    const id = Number(params.id);
    const rows = await sql`
      SELECT id, album_id, url, width, height, title, created_at
        FROM photos
       WHERE album_id = ${id} AND published = TRUE
       ORDER BY sort_index ASC, created_at ASC, id ASC;
    `;
    return NextResponse.json({ items: rows.rows });
  } catch (e) {
    console.error('PUBLIC GET /api/albums/[id]/photos failed:', e);
    return NextResponse.json({ error: e.message || 'internal error' }, { status: 500 });
  }
}
