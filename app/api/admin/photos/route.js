// app/api/admin/photos/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const onlyPublished = searchParams.get('published') === 'true';
    const albumId = Number(searchParams.get('albumId')) || null;

    let rows;
    if (onlyPublished) {
      ({ rows } = await sql/* sql */`
        SELECT id, album_id, url, published, sort_index, created_at,
               ROW_NUMBER() OVER (PARTITION BY album_id ORDER BY sort_index, id) AS ordinal
        FROM photos
        WHERE published = TRUE AND (${albumId} IS NULL OR album_id = ${albumId})
        ORDER BY sort_index, id
      `);
    } else {
      ({ rows } = await sql/* sql */`
        SELECT id, album_id, url, published, sort_index, created_at,
               ROW_NUMBER() OVER (PARTITION BY album_id ORDER BY sort_index, id) AS ordinal
        FROM photos
        WHERE (${albumId} IS NULL OR album_id = ${albumId})
        ORDER BY sort_index, id
      `);
    }

    return new NextResponse(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
