// app/api/admin/upload/route.js
export const runtime = 'nodejs';

import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request) {
  try {
    const body = await request.json();

    // Принудительно передаём токен
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) throw new Error('BLOB_READ_WRITE_TOKEN is missing');

    const result = await handleUpload({
      body,
      request,
      token, // <— ключевая строка!
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        addRandomSuffix: true,
      }),
      onUploadCompleted: async ({ blob }) => {
        await sql`
          INSERT INTO photos (url, published)
          VALUES (${blob.url}, TRUE)
        `;
      },
    });

    // Возвращаем результат напрямую
    return NextResponse.json(result);
  } catch (err) {
    console.error('UPLOAD ERROR:', err);
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 400 }
    );
  }
}
