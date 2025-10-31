// app/api/admin/photos/route.js
import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

function jerror(status, msg) {
  return NextResponse.json({ error: msg }, { status });
}

function mapRow(r) {
  // Возвращаем и published, и is_published — фронт примет любое
  return {
    id: r.id,
    url: r.url,
    album_id: r.album_id,
    albumId: r.album_id,
    sort_index: r.sort_index,
    sortIndex: r.sort_index,
    published: r.published,
    is_published: r.published,
  };
}

/**
 * GET /api/admin/photos?albumId=7&includeHidden=1
 * поддерживаем albumId и album_id
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const albumIdRaw = searchParams.get('albumId') ?? searchParams.get('album_id');
    if (!albumIdRaw) return jerror(400, 'albumId is required');

    const albumId = Number(albumIdRaw);
    if (!Number.isFinite(albumId)) return jerror(400, 'albumId must be a number');

    const includeHidden = ['1', 'true', 'yes'].includes(
      (searchParams.get('includeHidden') || '').toLowerCase()
    );

    // published — реальное имя поля в БД
    const rows = includeHidden
      ? await sql`
          SELECT id, url, album_id, sort_index, published
          FROM photos
          WHERE album_id = ${albumId}
          ORDER BY sort_index NULLS LAST, id
        `
      : await sql`
          SELECT id, url, album_id, sort_index, published
          FROM photos
          WHERE album_id = ${albumId}
            AND COALESCE(published, true) = true
          ORDER BY sort_index NULLS LAST, id
        `;

    return NextResponse.json(rows.map(mapRow));
  } catch (e) {
    return jerror(500, e.message || 'Internal error');
  }
}

/**
 * POST /api/admin/photos/reorder
 * Body: { ids: number[], albumId: number }
 */
export async function POST(req) {
  try {
    const pathname = new URL(req.url).pathname || '';
    const isReorder = pathname.endsWith('/reorder');
    if (!isReorder) return jerror(404, 'Not found');

    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body.ids) ? body.ids : [];
    const albumId = Number(body.albumId);
    if (!Number.isFinite(albumId)) return jerror(400, 'albumId must be a number');
    if (ids.length === 0) return jerror(400, 'ids must be a non-empty array');

    const present = await sql`
      SELECT id FROM photos
      WHERE album_id = ${albumId} AND id = ANY(${ids})
    `;
    const presentIds = new Set(present.map(r => r.id));
    const unknown = ids.filter(id => !presentIds.has(id));
    if (unknown.length) {
      return jerror(400, `Some ids do not belong to album ${albumId}: ${unknown.join(', ')}`);
    }

    await sql`BEGIN`;
    for (let i = 0; i < ids.length; i++) {
      await sql`
        UPDATE photos
        SET sort_index = ${i + 1}
        WHERE id = ${ids[i]} AND album_id = ${albumId}
      `;
    }
    await sql`COMMIT`;

    return NextResponse.json({ ok: true });
  } catch (e) {
    try { await sql`ROLLBACK`; } catch {}
    return jerror(500, e.message || 'Internal error');
  }
}

/**
 * PATCH /api/admin/photos/:id
 * Body: { published?: boolean, url?: string }
 */
export async function PATCH(req) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split('/').filter(Boolean); // ["api","admin","photos",":id"]
    const id = Number(parts[parts.length - 1]);
    if (!Number.isFinite(id)) return jerror(400, 'Invalid photo id');

    const body = await req.json().catch(() => ({}));
    const sets = [];

    if (typeof body.published === 'boolean') {
      sets.push(sql`published = ${body.published}`);
    }
    if (typeof body.url === 'string' && body.url) {
      sets.push(sql`url = ${body.url}`);
    }
    if (sets.length === 0) return jerror(400, 'No fields to update');

    await sql`
      UPDATE photos
      SET ${sql.join(sets, sql`, `)}
      WHERE id = ${id}
    `;

    const [row] = await sql`
      SELECT id, url, album_id, sort_index, published
      FROM photos
      WHERE id = ${id}
    `;

    return NextResponse.json(row ? mapRow(row) : null);
  } catch (e) {
    return jerror(500, e.message || 'Internal error');
  }
}

/**
 * DELETE /api/admin/photos/:id
 */
export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split('/').filter(Boolean);
    const id = Number(parts[parts.length - 1]);
    if (!Number.isFinite(id)) return jerror(400, 'Invalid photo id');

    await sql`DELETE FROM photos WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return jerror(500, e.message || 'Internal error');
  }
}
