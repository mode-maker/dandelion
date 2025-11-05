// app/api/admin/albums/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET — список альбомов с количеством фото и 3 превью
export async function GET() {
  try {
    const { rows } = await sql`
      SELECT a.id, a.title, a.published, a.created_at,
             COALESCE(cnt.c, 0)::int AS photo_count,
             COALESCE(prev.preview, '{}'::json) AS preview
      FROM albums a
      LEFT JOIN (
        SELECT album_id, COUNT(*)::int AS c
        FROM photos
        GROUP BY album_id
      ) cnt ON cnt.album_id = a.id
      LEFT JOIN (
        SELECT album_id, json_agg(json_build_object('url', url, 'id', id) ORDER BY sort_index ASC, id ASC) as preview
        FROM (
          SELECT p.*
          FROM photos p
          ORDER BY p.album_id, p.sort_index ASC, p.id ASC
        ) p2
        GROUP BY album_id
      ) prev ON prev.album_id = a.id
      ORDER BY a.created_at DESC, a.id DESC
    `;
    return NextResponse.json({ items: rows });
  } catch (e) {
    console.error('GET /api/admin/albums failed:', e);
    return NextResponse.json({ error: e.message || 'internal error' }, { status: 500 });
  }
}

// POST { title }
export async function POST(req) {
  try {
    const body = await req.json();
    const title = (body?.title || '').trim();
    if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 });
    const { rows } = await sql`
      INSERT INTO albums (title, published)
      VALUES (${title}, TRUE)
      RETURNING id, title, published, created_at
    `;
    return NextResponse.json({ item: rows[0] });
  } catch (e) {
    console.error('POST /api/admin/albums failed:', e);
    return NextResponse.json({ error: e.message || 'internal error' }, { status: 500 });
  }
}

// PATCH { id, title?, published? }
export async function PATCH(req) {
  try {
    const body = await req.json();
    if (!body?.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const sets = [];
    const vals = [];
    let i = 1;

    if ('title' in body)     { sets.push(`title = $${i++}`);     vals.push(body.title); }
    if ('published' in body) { sets.push(`published = $${i++}`); vals.push(!!body.published); }

    if (!sets.length) return NextResponse.json({ ok: true });
    vals.push(body.id);

    await sql.query(`UPDATE albums SET ${sets.join(', ')} WHERE id = $${i}`, vals);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('PATCH /api/admin/albums failed:', e);
    return NextResponse.json({ error: e.message || 'internal error' }, { status: 500 });
  }
}

// DELETE { id }
export async function DELETE(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await sql`DELETE FROM photos WHERE album_id = ${body.id}`;
    await sql`DELETE FROM albums WHERE id = ${body.id}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/admin/albums failed:', e);
    return NextResponse.json({ error: e.message || 'internal error' }, { status: 500 });
  }
}
