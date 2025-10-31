// app/api/admin/photos/attach-orphans/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request) {
  try {
    const { albumId } = await request.json().catch(() => ({}));
    const aid = Number(albumId) || null;
    if (!aid) return NextResponse.json({ error: 'albumId required' }, { status: 400 });

    // текущий max sort_index в целевом альбоме
    const { rows: maxr } = await sql`SELECT COALESCE(MAX(sort_index),0) AS max_pos FROM photos WHERE album_id = ${aid}`;
    let pos = Number(maxr?.[0]?.max_pos || 0);

    // заберём id «осиротевших»
    const { rows: orphans } = await sql`SELECT id FROM photos WHERE album_id IS NULL ORDER BY id`;
    for (const o of orphans) {
      pos += 1;
      await sql`UPDATE photos SET album_id = ${aid}, sort_index = ${pos} WHERE id = ${o.id}`;
    }
    return NextResponse.json({ ok: true, moved: orphans.length });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
