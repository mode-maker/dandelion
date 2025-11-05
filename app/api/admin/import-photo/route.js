// app/api/admin/import-photo/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(req) {
  const { albumId, url } = await req.json().catch(() => ({}));
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });

  await sql/* sql */`
    INSERT INTO photos (album_id, url, published)
    VALUES (${albumId ? Number(albumId) : null}, ${url}, TRUE)
  `;

  return NextResponse.json({ ok: true });
}
