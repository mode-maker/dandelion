import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request) {
  const body = await request.json();
  try {
    const json = await handleUpload({
      body,
      request,
      // выдаём токен клиенту — что можно грузить
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        addRandomSuffix: true,
      }),
      // когда загрузка в Blob завершена — пишем запись в БД
      onUploadCompleted: async ({ blob }) => {
        await sql/* sql */`
          INSERT INTO photos (url, published)
          VALUES (${blob.url}, TRUE)
        `;
      },
    });

    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 400 });
  }
}
