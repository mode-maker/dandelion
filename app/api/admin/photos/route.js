// app/api/admin/photos/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { del as blobDel } from '@vercel/blob';

// GET /api/admin/photos?albumId=&q=&published=&limit=&offset=
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const albumId = searchParams.get('albumId');
    const q = (searchParams.get('q') || '').trim();
    const published = searchParams.get('published'); // 'true' | 'false' | 'all'
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '30', 10)));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));

    // динамически собираем WHERE c безопасной интерполяцией
    const conds = [];
    if (albumId) conds.push(sql`album_id = ${Number(albumId)}`);
    if (published === 'true') conds.push(sql`published = TRUE`);
    if (published === 'false') conds.push(sql`published = FALSE`);
    if (q) conds.push(sql`(title ILIKE ${'%' + q + '%'} OR ${q} = ANY(tags))`);

    const where = conds.length ? sql`WHERE ${sql.join(conds, sql` AND `)}` : sql``;

    const rowsRes = await sql`
      SELECT id, album_id, url, width, height, title, tags, published, sort_index, created_at
        FROM photos
        ${where}
       ORDER BY created_at DESC, id DESC
       LIMIT ${limit} OFFSET ${offset};
    `;

    const countRes = await sql`
      SELECT COUNT(*)::int AS c
        FROM photos
        ${where};
    `;

    return NextResponse.json({
      items: rowsRes.rows,
      total: countRes.rows[0]?.c || 0,
      limit,
      offset,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('GET /api/admin/photos failed:', e);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

// PATCH /api/admin/photos  body: { id, title?, tags?, published?, sort_index?, url? }
export async function PATCH(req) {
  try {
    const body = await req.json();
    if (!body || !body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const sets = [];
    if ('title' in body) sets.push(sql`title = ${body.title}`);
    if ('tags' in body) sets.push(sql`tags = ${body.tags}`);
    if ('published' in body) sets.push(sql`published = ${!!body.published}`);
    if ('sort_index' in body) sets.push(sql`sort_index = ${body.sort_index}`);
    if ('url' in body) sets.push(sql`url = ${body.url}`);

    if (!sets.length) return NextResponse.json({ ok: true });

    await sql`
      UPDATE photos
         SET ${sql.join(sets, sql`, `)}
       WHERE id = ${body.id};
    `;

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('PATCH /api/admin/photos failed:', e);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

// DELETE /api/admin/photos  body: { id, url }
export async function DELETE(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    await sql`DELETE FROM photos WHERE id = ${body.id};`;

    if (body.url && typeof body.url === 'string') {
      try { await blobDel(body.url); } catch {}
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/admin/photos failed:', e);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
