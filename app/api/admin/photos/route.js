// app/api/admin/photos/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { del as blobDel } from '@vercel/blob';

// GET /api/admin/photos?albumId=&q=&published=&limit=&offset=
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const albumId = searchParams.get('albumId');
  const q = searchParams.get('q')?.trim();
  const published = searchParams.get('published');
  const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '30', 10)));
  const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));

  const where: string[] = [];
  const params: any[] = [];
  let i = 1;

  if (albumId) { where.push(`album_id = $${i++}`); params.push(Number(albumId)); }
  if (published === 'true' || published === 'false') { where.push(`published = $${i++}`); params.push(published === 'true'); }
  if (q) { where.push(`(title ILIKE $${i} OR $${i} = ANY(tags))`); params.push(`%${q}%`); i++; }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [rowsRes, countRes] = await Promise.all([
    sql/* sql */`
      SELECT id, album_id, url, width, height, title, tags, published, sort_index, created_at
      FROM photos
      ${whereSql}
      ORDER BY created_at DESC, id DESC
      LIMIT ${limit} OFFSET ${offset}
    `.unsafe(params),
    sql/* sql */`
      SELECT COUNT(*)::int AS c
      FROM photos
      ${whereSql}
    `.unsafe(params),
  ]);

  return NextResponse.json({
    items: rowsRes.rows,
    total: countRes.rows[0]?.c || 0,
    limit, offset,
  }, { headers: { 'Cache-Control': 'no-store' } });
}

// PATCH /api/admin/photos  body: { id, title?, tags?, published?, sort_index? }
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const fields: string[] = [];
  const params: any[] = [];
  let i = 1;

  for (const [k, v] of Object.entries(body)) {
    if (k === 'id') continue;
    if (['title', 'tags', 'published', 'sort_index'].includes(k)) {
      fields.push(`${k} = $${i++}`);
      params.push(v);
    }
  }
  if (!fields.length) return NextResponse.json({ ok: true });

  params.push(body.id);

  const { rowCount } = await sql/* sql */`
    UPDATE photos SET ${sql.raw(fields.join(', '))}
    WHERE id = $${i}
  `.unsafe(params);

  return NextResponse.json({ ok: rowCount > 0 });
}

// DELETE /api/admin/photos  body: { id, url }
export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  // сначала удалим запись
  await sql/* sql */`DELETE FROM photos WHERE id = ${body.id}`;

  // затем удалим blob (если передан url и он действительно твой)
  if (body.url && typeof body.url === 'string') {
    try { await blobDel(body.url); } catch { /* ignore */ }
  }
  return NextResponse.json({ ok: true });
}
