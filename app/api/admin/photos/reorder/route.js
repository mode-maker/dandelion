// app/api/admin/photos/reorder/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const ids = Array.isArray(body?.ids) ? body.ids : null;
    const albumId = Number(body?.albumId) || null;
    if (!ids?.length) return NextResponse.json({ error: 'ids[] required' }, { status: 400 });
    if (!albumId) return NextResponse.json({ error: 'albumId required' }, { status: 400 });

    await sql/* sql */`BEGIN`;
    try {
      for (let i = 0; i < ids.length; i++) {
        const id = Number(ids[i]);
        if (!Number.isFinite(id)) continue;
        await sql/* sql */`
          UPDATE photos
          SET sort_index = ${i + 1}
          WHERE id = ${id} AND album_id = ${albumId}
        `;
      }
      await sql/* sql */`COMMIT`;
    } catch (e) {
      await sql/* sql */`ROLLBACK`;
      throw e;
    }

    revalidatePath(`/albums/${albumId}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
