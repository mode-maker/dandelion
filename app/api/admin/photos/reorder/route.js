// app/api/admin/photos/reorder/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * POST /api/admin/photos/reorder
 * body: { id: number, direction: 'up' | 'down' }
 * Меняет местами sort_index текущей фотографии и её соседа в пределах альбома.
 */
export async function POST(req) {
  try {
    const { id, direction } = await req.json();

    if (!id || !['up', 'down'].includes(direction)) {
      return NextResponse.json({ error: 'id and direction required' }, { status: 400 });
    }

    // Текущая фотка
    const curRes = await sql`
      SELECT id, album_id, sort_index
      FROM photos
      WHERE id = ${id}
      LIMIT 1;
    `;
    const cur = curRes.rows[0];
    if (!cur) return NextResponse.json({ error: 'photo not found' }, { status: 404 });

    // Сосед сверху/снизу
    const neighRes = await sql`
      SELECT id, sort_index
      FROM photos
      WHERE album_id = ${cur.album_id}
        AND ${direction === 'up'
            ? sql`sort_index < ${cur.sort_index}`
            : sql`sort_index > ${cur.sort_index}`}
      ORDER BY sort_index ${direction === 'up' ? sql`DESC` : sql`ASC`}
      LIMIT 1;
    `;
    const neigh = neighRes.rows[0];
    if (!neigh) {
      // уже крайняя — ничего не делаем
      return NextResponse.json({ ok: true, edge: true });
    }

    // 3 шага, чтобы исключить коллизии значений
    const TMP = -99999999; // временное значение
    await sql`UPDATE photos SET sort_index = ${TMP} WHERE id = ${cur.id};`;
    await sql`UPDATE photos SET sort_index = ${cur.sort_index} WHERE id = ${neigh.id};`;
    await sql`UPDATE photos SET sort_index = ${neigh.sort_index} WHERE id = ${cur.id};`;

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('POST /api/admin/photos/reorder failed:', e);
    return NextResponse.json({ error: e.message || 'internal error' }, { status: 500 });
  }
}
