// app/api/admin/albums/[id]/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(_req, { params }) {
  try {
    const id = Number(params.id);
    const r = await sql`SELECT id, title, created_at FROM albums WHERE id = ${id};`;
    if (!r.rowCount) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({ album: r.rows[0] });
  } catch (e) {
    console.error('GET /api/admin/albums/[id] failed:', e);
    return NextResponse.json({ error: e.message || 'internal error' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    if (!('title' in body)) return NextResponse.json({ ok: true });
    const title = (body.title || '').trim();
    await sql`UPDATE albums SET title = ${title} WHERE id = ${id};`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('PATCH /api/admin/albums/[id] failed:', e);
    return NextResponse.json({ error: e.message || 'internal error' }, { status: 500 });
  }
}
