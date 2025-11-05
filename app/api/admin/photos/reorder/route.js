// app/api/admin/photos/reorder/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * POST body: { currentId: number, neighborId: number }
 * Меняет местами sort_index у двух фотографий в рамках одного альбома.
 */
export async function POST(req) {
  try {
    const { currentId, neighborId } = await req.json();
    if (!currentId || !neighborId) {
      return NextResponse.json({ error: 'currentId and neighborId required' }, { status: 400 });
    }

    // Получаем текущие индексы и альбом
    const { rows } = await sql`
      SELECT id, album_id, sort_index
      FROM photos
      WHERE id = ANY(${[currentId, neighborId]})
      ORDER BY id ASC
    `;
    if (rows.length !== 2) {
      return NextResponse.json({ error: 'photos not found' }, { status: 404 });
    }
    const a = rows.find(r => r.id === currentId);
    const b = rows.find(r => r.id === neighborId);
    if (!a || !b) return NextResponse.json({ error: 'photos not found' }, { status: 404 });
    if (a.album_id !== b.album_id) {
      return NextResponse.json({ error: 'must be same album' }, { status: 400 });
    }

    // Атомарно меняем местами
    await sql`
      UPDATE photos p
      SET sort_index = CASE
        WHEN p.id = ${a.id} THEN ${b.sort_index}
        WHEN p.id = ${b.id} THEN ${a.sort_index}
      END
      WHERE p.id = ANY(${[a.id, b.id]})
    `;

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('POST /api/admin/photos/reorder failed:', e);
    return NextResponse.json({ error: e.message || 'internal error' }, { status: 500 });
  }
}
