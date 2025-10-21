// app/api/admin/upload/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { handleUpload } from '@vercel/blob/client';
import { sql } from '@vercel/postgres';

export async function POST(request) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'Missing env: BLOB_READ_WRITE_TOKEN' },
        { status: 500 }
      );
    }

    // ВНИМАНИЕ: мы НЕ принимаем большие файлы сюда.
    // Этот роут выдаёт одноразовые токены и принимает "сигналы" от Blob после успешной загрузки.
    const body = await request.json();

    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        addRandomSuffix: true,
      }),
      onUploadCompleted: async ({ blob }) => {
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
      token, // RW-токен берём из переменных окружения (Vercel)
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
