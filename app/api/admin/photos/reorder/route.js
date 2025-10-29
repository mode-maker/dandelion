// app/api/admin/photos/reorder/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request) {
  try {
    await sql/* sql */`ALTER TABLE photos ADD COLUMN IF NOT EXISTS sort_index INT DEFAULT 0`;

    const body = await request.json().catch(() => ({}));
    const ids = Array.isArray(body?.ids) ? body.ids : null;
    if (!ids?.length) return NextResponse.json({ error: 'ids[] required' }, { status: 400 });

    // Обновляем последовательно (надёжно везде). Для небольших коллекций это ок.
    await sql/* sql */`BEGIN`;
    try {
      for (let i = 0; i < ids.length; i++) {
        const id = Number(ids[i]);
        if (!Number.isFinite(id)) continue;
        const pos = i + 1;
        await sql/* sql */`UPDATE photos SET sort_index = ${pos} WHERE id = ${id}`;
      }
      await sql/* sql */`COMMIT`;
    } catch (e) {
      await sql/* sql */`ROLLBACK`;
      throw e;
    }

    revalidatePath('/');
    revalidatePath('/gallery');
    revalidateTag('gallery');

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('REORDER ERROR:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
