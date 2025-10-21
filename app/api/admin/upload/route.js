// app/api/admin/upload/route.js
export const runtime = 'nodejs';           // можно 'edge', если хочешь
export const dynamic = 'force-dynamic';    // чтобы не было кэша

import { NextResponse } from 'next/server';
import { handleUpload } from '@vercel/blob';     // серверный импорт
import { sql } from '@vercel/postgres';

export async function POST(request) {
  try {
    // ❗ ВАЖНО: НЕ вычитываем body (никакого request.json() / formData())
    // handleUpload сам прочитает multipart-стрим запроса
    const result = await handleUpload(request, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,      // токен только на сервере

      // Разрешаем только изображения + рандомный суффикс
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        addRandomSuffix: true,
      }),

      // После успешной загрузки — сохраняем запись в БД
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
    });

    // result — это JSON, который можно отдать как есть
    return NextResponse.json({ ok: true, uploaded: result });
  } catch (err) {
    console.error('UPLOAD ERROR:', err);
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 400 },
    );
  }
}

// По желанию можно запретить всё кроме POST
export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
