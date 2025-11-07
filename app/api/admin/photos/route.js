// GET/PATCH/DELETE для фото (список, изменение, удаление)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { del as blobDel } from '@vercel/blob';

// Список фото
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const albumId = searchParams.get('albumId');
    const q = (searchParams.get('q') || '').trim();
    const published = searchParams.get('published');
    const limit = Math.min(1000, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));

    let query = `
      SELECT id, album_id, url, width, height, title, published, sort_index, created_at
      FROM photos
    `;
    let countQuery = `SELECT COUNT(*)::int AS c FROM photos`;
    const conds = [];
    const values = [];

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

    if (conds.length) {
      const where = ' WHERE ' + conds.join(' AND ');
      query += where;
      countQuery += where;
    }

    query += ` ORDER BY sort_index ASC, COALESCE(created_at, NOW()) ASC, id ASC LIMIT ${limit} OFFSET ${offset}`;

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
    return NextResponse.json({ error: e?.message || 'internal error' }, { status: 500 });
  }
}

// Обновление фото (published / url / sort_index / title)
export async function PATCH(req) {
  try {
    const body = await req.json();
    if (!body?.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const sets = [];
    const vals = [];
    let i = 1;

    if ('title' in body) {
      sets.push(`title = $${i++}`);
      vals.push(body.title);
    }
    if ('published' in body) {
      sets.push(`published = $${i++}`);
      vals.push(!!body.published);
    }
    if ('url' in body) {
      sets.push(`url = $${i++}`);
      vals.push(body.url);
    }
    if ('sort_index' in body) {
      sets.push(`sort_index = $${i++}`);
      vals.push(Number(body.sort_index));
    }

    if (!sets.length) return NextResponse.json({ ok: true });

    vals.push(body.id);
    await sql.query(`UPDATE photos SET ${sets.join(', ')} WHERE id = $${i}`, vals);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('PATCH /api/admin/photos failed:', e);
    return NextResponse.json({ error: e?.message || 'internal error' }, { status: 500 });
  }
}

// Удаление фото
export async function DELETE(req) {
  try {
    // body может быть пустым на некоторых окружениях — подстрахуемся
    const bodyText = await req.text();
    const body = bodyText ? JSON.parse(bodyText) : null;

    if (!body?.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    await sql.query(`DELETE FROM photos WHERE id = $1`, [body.id]);

    // Если указали url — пробуем удалить из Blob
    if (body.url) {
      try {
        await blobDel(body.url);
      } catch {
        // проглатываем, чтобы удаление в БД не считалось ошибкой
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/admin/photos failed:', e);
    return NextResponse.json({ error: e?.message || 'internal error' }, { status: 500 });
  }
}
