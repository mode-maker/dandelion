// app/api/admin/albums/[id]/photos/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(_req, { params }) {
  try {
    const id = Number(params.id);
    const rows = await sql`
      SELECT id, album_id, url, width, height, title, published, sort_index, created_at
        FROM photos
       WHERE album_id = ${id}
       ORDER BY sort_index ASC, created_at ASC, id ASC;
    `;
    return NextResponse.json({ items: rows.rows });
  } catch (e) {
    console.error('GET /api/admin/albums/[id]/photos failed:', e);
    return NextResponse.json({ error: e.message || 'internal error' }, { status: 500 });
  }
}

// PATCH body: { order: [{id, sort_index}, ...] }
export async function PATCH(req, { params }) {
  try {
    const id = Number(params.id);
    const body = await req.json().catch(() => ({}));
    const order = Array.isArray(body.order) ? body.order : [];
    if (!order.length) return NextResponse.json({ ok: true });

    // транзакцией: обновляем только фото данного альбома
    for (const row of order) {
      await sql`
        UPDATE photos
           SET sort_index = ${Number(row.sort_index)}
         WHERE id = ${Number(row.id)} AND album_id = ${id};
      `;
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('PATCH /api/admin/albums/[id]/photos failed:', e);
    return NextResponse.json({ error: e.message || 'internal error' }, { status: 500 });
  }
}
