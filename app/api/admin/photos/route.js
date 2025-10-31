// app/api/admin/photos/route.js
import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Подключение к Neon (DATABASE_URL должен быть задан)
const sql = neon(process.env.DATABASE_URL);

// Универсальная утилита ответа с ошибкой
function err(status, msg) {
  return NextResponse.json({ error: msg }, { status });
}

// Нормализация строк -> JSON с именами как на фронте
function mapPhotoRow(r) {
  return {
    id: r.id,
    url: r.url,
    album_id: r.album_id,         // сохраняем snake_case для совместимости
    albumId: r.album_id,          // и camelCase — фронту удобно
    sort_index: r.sort_index,
    sortIndex: r.sort_index,
    is_published: r.is_published,
    published: r.is_published
  };
}

/**
 * GET /api/admin/photos?albumId=7&includeHidden=1
 * (поддерживаем и album_id)
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const albumIdRaw =
      searchParams.get('albumId') ??
      searchParams.get('album_id');

    if (!albumIdRaw) return err(400, 'albumId is required');

    const albumId = Number(albumIdRaw);
    if (!Number.isFinite(albumId)) return err(400, 'albumId must be a number');

    const includeHidden = ['1', 'true', 'yes'].includes(
      (searchParams.get('includeHidden') || '').toLowerCase()
    );

    // Два готовых параметризованных запроса (без конкатенации SQL!)
    const rows = includeHidden
      ? await sql`
          SELECT id, url, album_id, sort_index, is_published
          FROM photos
          WHERE album_id = ${albumId}
          ORDER BY
            sort_index NULLS LAST,
            id
        `
      : await sql`
          SELECT id, url, album_id, sort_index, is_published
          FROM photos
          WHERE album_id = ${albumId}
            AND is_published = true
          ORDER BY
            sort_index NULLS LAST,
            id
        `;

    return NextResponse.json(rows.map(mapPhotoRow));
  } catch (e) {
    return err(500, e.message || 'Internal error');
  }
}

/**
 * POST /api/admin/photos/reorder
 * Body: { ids: number[], albumId: number }
 * Пронумеровывает sort_index по порядку массива ids
 */
export async function POST(req) {
  try {
    const pathname = new URL(req.url).pathname || '';
    const isReorder = pathname.endsWith('/reorder');

    if (!isReorder) {
      return err(404, 'Not found');
    }

    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body.ids) ? body.ids : [];
    const albumId = Number(body.albumId);

    if (!Number.isFinite(albumId)) return err(400, 'albumId must be a number');
    if (ids.length === 0) return err(400, 'ids must be a non-empty array');

    // Проверим, что все id относятся к этому альбому (опционально)
    const present = await sql`
      SELECT id FROM photos WHERE album_id = ${albumId} AND id = ANY(${ids})
    `;
    const presentIds = new Set(present.map(r => r.id));
    const unknown = ids.filter(id => !presentIds.has(id));
    if (unknown.length) {
      return err(400, `Some ids do not belong to album ${albumId}: ${unknown.join(', ')}`);
    }

    // Обновляем порядок — один батч в транзакции
    await sql`BEGIN`;
    for (let i = 0; i < ids.length; i++) {
      // sort_index начинаем с 1
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
    return err(500, e.message || 'Internal error');
  }
}

/**
 * PATCH /api/admin/photos/:id
 * Body: { published?: boolean, url?: string }
 */
export async function PATCH(req) {
  try {
    // В Next Route Handlers PATCH не получает params, берём из url
    const url = new URL(req.url);
    const segments = url.pathname.split('/').filter(Boolean); // ["api","admin","photos",":id"]
    const idStr = segments[segments.length - 1];
    const id = Number(idStr);
    if (!Number.isFinite(id)) return err(400, 'Invalid photo id');

    const body = await req.json().catch(() => ({}));
    const updates = [];

    if (typeof body.published === 'boolean') {
      updates.push(sql`is_published = ${body.published}`);
    }
    if (typeof body.url === 'string' && body.url) {
      updates.push(sql`url = ${body.url}`);
    }

    if (updates.length === 0) return err(400, 'No fields to update');

    // Сборка безопасным способом: sql`` поддерживает интерполяцию фрагментов
    await sql`
      UPDATE photos
      SET ${sql.join(updates, sql`, `)}
      WHERE id = ${id}
    `;

    const [row] = await sql`
      SELECT id, url, album_id, sort_index, is_published
      FROM photos
      WHERE id = ${id}
    `;

    return NextResponse.json(row ? mapPhotoRow(row) : null);
  } catch (e) {
    return err(500, e.message || 'Internal error');
  }
}

/**
 * DELETE /api/admin/photos/:id
 */
export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const segments = url.pathname.split('/').filter(Boolean);
    const idStr = segments[segments.length - 1];
    const id = Number(idStr);
    if (!Number.isFinite(id)) return err(400, 'Invalid photo id');

    await sql`DELETE FROM photos WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return err(500, e.message || 'Internal error');
  }
}
