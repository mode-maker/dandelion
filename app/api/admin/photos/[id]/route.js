// app/api/admin/photos/[id]/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { revalidatePath, revalidateTag } from 'next/cache';
import { del } from '@vercel/blob';

async function bump() {
  revalidatePath('/');
  revalidatePath('/gallery');
  revalidateTag('gallery');
}

export async function PATCH(request, { params }) {
  try {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'Bad id' }, { status: 400 });

    const body = await request.json();
    // Разрешаем менять опубликованность, заголовок и позицию
    const { published, title, sort_index } = body || {};

    if (typeof published !== 'boolean' && typeof title !== 'string' && typeof sort_index !== 'number') {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const fields = [];
    if (typeof published === 'boolean') fields.push(sql`published = ${published}`);
    if (typeof title === 'string')     fields.push(sql`title = ${title}`);
    if (typeof sort_index === 'number')fields.push(sql`sort_index = ${sort_index}`);

    const { rows } = await sql/* sql */`
      UPDATE photos
      SET ${sql.join(fields, sql`, `)}
      WHERE id = ${id}
      RETURNING id, url, published, sort_index, title
    `;

    await bump();
    return NextResponse.json(rows[0] || null);
  } catch (err) {
    console.error('PHOTO PATCH ERROR:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'Bad id' }, { status: 400 });

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    // Получим url, чтобы удалить блоб (опционально)
    const { rows } = await sql/* sql */`DELETE FROM photos WHERE id = ${id} RETURNING url`;
    const url = rows?.[0]?.url;

    if (token && url) {
      try { await del(url, { token }); } catch (e) { console.warn('BLOB DEL WARN:', e?.message); }
    }

    await bump();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PHOTO DELETE ERROR:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
