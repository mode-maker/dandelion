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

    // Страховка: колонка порядка
    await sql/* sql */`ALTER TABLE photos ADD COLUMN IF NOT EXISTS sort_index INT DEFAULT 0`;

    const body = await request.json().catch(() => ({}));
    let { published, title, sort_index } = body || {};

    // Приводим типы и используем COALESCE: если поле не передано — оставляем текущее
    const hasAny =
      typeof published === 'boolean' ||
      typeof title === 'string' ||
      Number.isFinite(Number(sort_index));

    if (!hasAny) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    if (typeof published !== 'boolean') published = null;
    if (typeof title !== 'string') title = null;
    sort_index = Number.isFinite(Number(sort_index)) ? Number(sort_index) : null;

    const { rows } = await sql/* sql */`
      UPDATE photos
      SET
        published  = COALESCE(${published}, published),
        title      = COALESCE(${title}, title),
        sort_index = COALESCE(${sort_index}, sort_index)
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

    await sql/* sql */`ALTER TABLE photos ADD COLUMN IF NOT EXISTS sort_index INT DEFAULT 0`;

    // Удаляем запись и блоб (если есть токен)
    const token = process.env.BLOB_READ_WRITE_TOKEN;
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
