// app/api/albums/[id]/photos/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(req, { params }) {
  try {
    const albumId = Number(params.id);
    if (!albumId) return NextResponse.json({ error: 'bad id' }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const limit = Math.min(60, Math.max(6, parseInt(searchParams.get('limit') || '24', 10)));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));

    const [{ rows }, totalRes] = await Promise.all([
      sql/* sql */`
        SELECT id, album_id, url, width, height, published, sort_index, created_at
        FROM photos
        WHERE published = TRUE AND album_id = ${albumId}
        ORDER BY sort_index, id
        LIMIT ${limit} OFFSET ${offset}
      `,
      sql/* sql */`
        SELECT COUNT(*)::int AS c
        FROM photos
        WHERE published = TRUE AND album_id = ${albumId}
      `,
    ]);

    return NextResponse.json({
      items: rows,
      total: totalRes.rows?.[0]?.c || 0,
      limit,
      offset
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
