// app/api/admin/albums/[id]/photos/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';

function normName(name = 'image') {
  return String(name).replace(/[^\w.\-]+/g, '_').slice(0, 80);
}

// GET список фото альбома
export async function GET(_req, { params }) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: 'bad album id' }, { status: 400 });
    }
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

// POST загрузка новых фото в альбом
export async function POST(req, { params }) {
  try {
    const albumId = Number(params.id);
    if (!Number.isFinite(albumId)) {
      return NextResponse.json({ error: 'bad album id' }, { status: 400 });
    }

    const form = await req.formData();
    const files = form.getAll('files').filter(Boolean);
    if (!files.length) {
      return NextResponse.json({ error: 'no files' }, { status: 400 });
    }

    // текущий max sort_index для альбома
    const maxRes = await sql`
      SELECT COALESCE(MAX(sort_index), -1) AS max_index
        FROM photos
       WHERE album_id = ${albumId};
    `;
    let sortIndex = (maxRes.rows?.[0]?.max_index ?? -1) + 1;

    const created = [];

    for (const file of files) {
      // file — это Blob из FormData
      const origName = normName(file.name || 'image');
      const key = `albums/${albumId}/${Date.now()}-${Math.random().toString(36).slice(2)}-${origName}`;

      // заливаем в Vercel Blob
      const { url } = await put(key, file, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN, // уже есть у тебя в переменных окружения
        addRandomSuffix: false,
      });

      // записываем в БД
      const ins = await sql`
        INSERT INTO photos (album_id, url, width, height, title, published, sort_index, created_at)
        VALUES (${albumId}, ${url}, NULL, NULL, NULL, TRUE, ${sortIndex}, NOW())
        RETURNING id, album_id, url, width, height, title, published, sort_index, created_at;
      `;

      created.push(ins.rows[0]);
      sortIndex += 1;
    }

    return NextResponse.json({ ok: true, items: created }, { status: 201 });
  } catch (e) {
    console.error('POST /api/admin/albums/[id]/photos failed:', e);
    return NextResponse.json({ error: e.message || 'internal error' }, { status: 500 });
  }
}

// PATCH — изменение порядка (ожидает { order: [{id, sort_index}, ...] })
export async function PATCH(req, { params }) {
  try {
    const albumId = Number(params.id);
    const body = await req.json();
    const order = Array.isArray(body?.order) ? body.order : [];
    if (!Number.isFinite(albumId) || !order.length) {
      return NextResponse.json({ ok: true });
    }

    for (const row of order) {
      await sql`
        UPDATE photos
           SET sort_index = ${Number(row.sort_index)}
         WHERE id = ${Number(row.id)} AND album_id = ${albumId};
      `;
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('PATCH /api/admin/albums/[id]/photos failed:', e);
    return NextResponse.json({ error: e.message || 'internal error' }, { status: 500 });
  }
}
