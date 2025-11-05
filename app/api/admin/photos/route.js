// app/api/admin/photos/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { del as blobDel } from '@vercel/blob';

// GET — фото (с фильтром по albumId). Пагинация опциональна.
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const albumId = searchParams.get('albumId');
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '100', 10)));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));

    let where = '';
    const vals = [];
    if (albumId) { where = ` WHERE album_id = $1`; vals.push(Number(albumId)); }

    const qRows = await sql.query(
      `
        SELECT id, album_id, url, width, height, title, published, sort_index, created_at
        FROM photos
        ${where}
        ORDER BY sort_index ASC, id ASC
        LIMIT ${limit} OFFSET ${offset}
      `,
      vals
    );
    const qCnt = await sql.query(`SELECT COUNT(*)::int AS c FROM photos${where}`, vals);

    return NextResponse.json({ items: qRows.rows, total: qCnt.rows?.[0]?.c || 0, limit, offset });
  } catch (e) {
    console.error('GET /api/admin/photos failed:', e);
    return NextResponse.json({ error: e.message || 'internal error' }, { status: 500 });
  }
}

// PATCH { id, title?, published?, url?, sort_index? }
export async function PATCH(req) {
  try {
    const body = await req.json();
    if (!body?.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const sets = [];
    const vals = [];
    let i = 1;

    if ('title' in body)     { sets.push(`title = $${i++}`);     vals.push(body.title); }
    if ('published' in body) { sets.push(`published = $${i++}`); vals.push(!!body.published); }
    if ('url' in body)       { sets.push(`url = $${i++}`);       vals.push(body.url); }
    if ('sort_index' in body){ sets.push(`sort_index = $${i++}`); vals.push(Number(body.sort_index)); }

    if (!sets.length) return NextResponse.json({ ok: true });
    vals.push(body.id);

    await sql.query(`UPDATE photos SET ${sets.join(', ')} WHERE id = $${i}`, vals);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('PATCH /api/admin/photos failed:', e);
    return NextResponse.json({ error: e.message || 'internal error' }, { status: 500 });
  }
}

// DELETE { id, url? }
export async function DELETE(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await sql`DELETE FROM photos WHERE id = ${body.id}`;
    if (body.url) { try { await blobDel(body.url); } catch {} }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/admin/photos failed:', e);
    return NextResponse.json({ error: e.message || 'internal error' }, { status: 500 });
  }
}
