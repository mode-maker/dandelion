// app/api/admin/upload/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
// ⬇️ ВАЖНО: серверный вариант handleUpload
import { handleUpload } from '@vercel/blob/server';
import { sql } from '@vercel/postgres';

export async function POST(request) {
  try {
    const body = await request.json();

    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        addRandomSuffix: true,
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log('Blob uploaded:', blob.url);

        // создаём таблицу при первом запуске (идемпотентно)
        await sql`
          CREATE TABLE IF NOT EXISTS photos (
            id SERIAL PRIMARY KEY,
            url TEXT NOT NULL,
            published BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;

        await sql`
          INSERT INTO photos (url, published) 
          VALUES (${blob.url}, TRUE);
        `;
      },

      // ⬇️ Передаём токен из переменных окружения
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ ok: true, uploaded: result });
  } catch (err) {
    console.error('UPLOAD ERROR:', err);
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 400 }
    );
  }
}
