// ЯВНО работаем в Node.js-функции (а не edge)
export const runtime = 'nodejs';

import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request) {
  try {
    const body = await request.json();

    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        addRandomSuffix: true,
      }),
      onUploadCompleted: async ({ blob }) => {
        // пишем запись в БД
        await sql/* sql */`
          INSERT INTO photos (url, published)
          VALUES (${blob.url}, TRUE)
        `;
      },
    });

    // Вернём понятный ответ клиенту
    return NextResponse.json({ ok: true, uploaded: result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 400 }
    );
  }
}
