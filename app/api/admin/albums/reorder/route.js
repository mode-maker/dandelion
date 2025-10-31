// app/api/admin/albums/reorder/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';

async function ensureSchema() {
  await sql`CREATE TABLE IF NOT EXISTS albums (id SERIAL PRIMARY KEY, title TEXT NOT NULL, event_date DATE, published BOOLEAN DEFAULT TRUE, sort_index INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW())`;
}

export async function POST(request) {
  try {
    await ensureSchema();

    const body = await request.json().catch(() => ({}));
    const ids = Array.isArray(body?.ids) ? body.ids : null;
    if (!ids?.length) return NextResponse.json({ error: 'ids[] required' }, { status: 400 });

    await sql`BEGIN`;
    try {
      for (let i = 0; i < ids.length; i++) {
        const id = Number(ids[i]);
        if (!Number.isFinite(id)) continue;
        await sql`UPDATE albums SET sort_index = ${i + 1} WHERE id = ${id}`;
      }
      await sql`COMMIT`;
    } catch (e) {
      await sql`ROLLBACK`;
      throw e;
    }

    revalidatePath('/albums');
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
