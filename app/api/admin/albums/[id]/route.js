// app/api/admin/albums/[id]/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';

async function ensureSchema() {
  await sql`CREATE TABLE IF NOT EXISTS albums (id SERIAL PRIMARY KEY, title TEXT NOT NULL, event_date DATE, published BOOLEAN DEFAULT TRUE, sort_index INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW())`;
}

export async function PATCH(request, { params }) {
  try {
    await ensureSchema();

    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'bad id' }, { status: 400 });
    const body = await request.json().catch(() => ({}));

    const title = typeof body.title === 'string' ? body.title.trim() : null;
    const event_date = body.event_date ? new Date(body.event_date) : null;
    const published = typeof body.published === 'boolean' ? body.published : null;
    const sort_index = Number.isFinite(Number(body.sort_index)) ? Number(body.sort_index) : null;

    const { rows } = await sql/* sql */`
      UPDATE albums
      SET
        title = COALESCE(${title}, title),
        event_date = COALESCE(${event_date}, event_date),
        published = COALESCE(${published}, published),
        sort_index = COALESCE(${sort_index}, sort_index)
      WHERE id = ${id}
      RETURNING id, title, event_date, published, sort_index, created_at
    `;
    revalidatePath('/albums');
    return NextResponse.json(rows[0] || null);
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    await ensureSchema();

    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'bad id' }, { status: 400 });

    await sql/* sql */`DELETE FROM albums WHERE id = ${id}`;
    revalidatePath('/albums');
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
