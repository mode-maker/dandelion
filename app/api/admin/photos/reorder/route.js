// app/api/admin/photos/reorder/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request) {
  try {
    const body = await request.json();
    const ids = Array.isArray(body?.ids) ? body.ids : null;
    if (!ids?.length) return NextResponse.json({ error: 'ids[] required' }, { status: 400 });

    // Обновляем sort_index через CASE
    const values = ids.map((id, idx) => ({ id: Number(id), pos: idx + 1 })).filter(v => v.id);
    if (!values.length) return NextResponse.json({ error: 'no valid ids' }, { status: 400 });

    const cases = values.map(v => sql`WHEN id = ${v.id} THEN ${v.pos}`);
    await sql/* sql */`
      UPDATE photos
      SET sort_index = CASE ${sql.join(cases, sql` `)} ELSE sort_index END
      WHERE id = ANY(${sql.array(values.map(v => v.id), 'int4')})
    `;

    revalidatePath('/');
    revalidatePath('/gallery');
    revalidateTag('gallery');

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('REORDER ERROR:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
