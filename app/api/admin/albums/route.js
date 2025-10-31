// app/api/admin/albums/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const { rows } = await sql/* sql */`
      SELECT
        a.id, a.title, a.event_date, a.published, a.sort_index, a.created_at,
        (
          SELECT url FROM photos
          WHERE album_id = a.id AND published = TRUE
          ORDER BY sort_index, id
          LIMIT 1
        ) AS cover_url,
        (
          SELECT COUNT(*)::INT FROM photos
          WHERE album_id = a.id AND published = TRUE
        ) AS published_count
      FROM albums a
      ORDER BY a.sort_index, a.id
    `;
    return NextResponse.json(rows, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const title = String(body?.title || '').trim();
    const event_date = body?.event_date ? new Date(body.event_date) : null;
    if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 });

    const { rows: maxr } = await sql/* sql */`SELECT COALESCE(MAX(sort_index),0) AS max_pos FROM albums`;
    const pos = Number(maxr?.[0]?.max_pos || 0) + 1;

    const { rows } = await sql/* sql */`
      INSERT INTO albums (title, event_date, published, sort_index)
      VALUES (${title}, ${event_date}, TRUE, ${pos})
      RETURNING id, title, event_date, published, sort_index, created_at
    `;

    revalidatePath('/albums');
    return NextResponse.json(rows[0]);
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
