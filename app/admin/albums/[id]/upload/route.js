// app/api/admin/albums/[id]/upload/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 60; // на всякий случай

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';

export async function POST(req, { params }) {
  try {
    const albumId = Number(params?.id);
    if (!albumId) {
      return NextResponse.json({ error: 'albumId required' }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'file required' }, { status: 400 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN not set' }, { status: 500 });
    }

    // загружаем файл в Vercel Blob (паблик)
    const blob = await put(`albums/${albumId}/${Date.now()}-${file.name}`, file, {
      access: 'public',
      token,
    });

    // создаём запись в БД (подгони поля под свою схему при необходимости)
    const insert = await sql`
      INSERT INTO photos (album_id, url, title, published, sort_index, created_at)
      VALUES (
        ${albumId},
        ${blob.url},
        '',
        true,
        COALESCE((SELECT COALESCE(MAX(sort_index),0)+1 FROM photos WHERE album_id=${albumId}), 0),
        NOW()
      )
      RETURNING id, album_id, url, title, published, sort_index, created_at
    `;

    return NextResponse.json({ ok: true, item: insert.rows[0] }, { status: 200 });
  } catch (e) {
    console.error('POST /api/admin/albums/[id]/upload failed:', e);
    return NextResponse.json({ error: e?.message || 'internal error' }, { status: 500 });
  }
}
