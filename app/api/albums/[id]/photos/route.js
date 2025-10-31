// app/api/albums/[id]/photos/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(_req, { params }) {
  try {
    const albumId = Number(params.id);
    if (!albumId) return NextResponse.json({ error: 'bad id' }, { status: 400 });

    const { rows } = await sql/* sql */`
      SELECT id, album_id, url, published, sort_index, created_at,
             ROW_NUMBER() OVER (ORDER BY sort_index, id) AS ordinal
      FROM photos
      WHERE published = TRUE AND album_id = ${albumId}
      ORDER BY sort_index, id
    `;
    return NextResponse.json(rows, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
