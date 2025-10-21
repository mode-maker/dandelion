// app/api/admin/upload/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { handleUpload } from '@vercel/blob/client';  // ← ВАЖНО: client!
import { sql } from '@vercel/postgres';

export async function POST(request) {
  try {
    const body = await request.json();

    const result = await handleUpload({
      request,
      body,

      // перед генерацией клиентского токена
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        addRandomSuffix: true,
      }),

      // после успешной загрузки — сохраняем запись в БД
      onUploadCompleted: async ({ blob }) => {
        console.log('Blob uploaded:', blob.url);

        await sql`
          CREATE TABLE IF NOT EXISTS photos (
            id SERIAL PRIMARY KEY,
            url TEXT NOT NULL,
            published BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;

        await sql`INSERT INTO photos (url, published) VALUES (${blob.url}, TRUE)`;
      },

      // пробрасываем серверный токен (env на Vercel)
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
