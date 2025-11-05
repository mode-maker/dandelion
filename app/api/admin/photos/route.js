export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { del as blobDel } from '@vercel/blob';

// ---------------- GET ----------------
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const albumId = searchParams.get('albumId');
    const q = (searchParams.get('q') || '').trim();
    const published = searchParams.get('published');
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '30', 10)));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));

    // Базовый SQL без условий
    let query = `
      SELECT id, album_id, url, width, height, title, published, created_at
      FROM photos
    `;
    let countQuery = `SELECT COUNT(*)::int AS c FROM photos`;
    const conds = [];
    const values = [];

    // Формируем условия вручную (без sql`` шаблонов)
    if (albumId) {
      conds.push(`album_id = $${conds.length + 1}`);
      values.push(Number(albumId));
    }
    if (published === 'true') conds.push(`published = TRUE`);
    if (published === 'false') conds.push(`published = FALSE`);
    if (q) {
      conds.push(`title ILIKE $${conds.length + 1}`);
      values.push(`%${q}%`);
    }

    if (conds.length > 0) {
      const whereClause = ' WHERE ' + conds.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += ` ORDER BY COALESCE(created_at, NOW()) DESC, id DESC LIMIT ${limit} OFFSET ${offset}`;

    const rowsRes = await sql.query(query, values);
    const countRes = await sql.query(countQuery, values);

    return NextResponse.json({
      items: rowsRes.rows,
      total: countRes.rows?.[0]?.c || 0,
      limit,
      offset,
    });
  } catch (e) {
    console.error('GET /api/admin/photos failed:', e);
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}

// ---------------- PATCH ----------------
export async function PATCH(req) {
  try {
    const body = await req.json();
    if (!body?.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const sets = [];
    const values = [];
    let i = 1;

    if ('title' in body) {
      sets.push(`title = $${i++}`);
      values.push(body.title);
    }
    if ('published' in body) {
      sets.push(`published = $${i++}`);
      values.push(!!body.published);
    }
    if ('url' in body) {
      sets.push(`url = $${i++}`);
      values.push(body.url);
    }

    if (!sets.length) return NextResponse.json({ ok: true });

    values.push(body.id);
    const query = `UPDATE photos SET ${sets.join(', ')} WHERE id = $${i}`;
    await sql.query(query, values);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('PATCH /api/admin/photos failed:', e);
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}

// ---------------- DELETE ----------------
export async function DELETE(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    await sql.query(`DELETE FROM photos WHERE id = $1`, [body.id]);

    if (body.url && typeof body.url === 'string') {
      try {
        await blobDel(body.url);
      } catch (err) {
        console.warn('Blob delete failed:', err.message);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/admin/photos failed:', e);
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
