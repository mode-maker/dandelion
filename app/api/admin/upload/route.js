// app/api/admin/upload/route.js
import { NextResponse } from 'next/server';
import { handleUpload } from '@vercel/blob/client';
import { sql } from '@vercel/postgres';

// Гарантируем Node.js рантайм и динамический рендер,
// иначе env может не подтянуться.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// export const revalidate = 0; // необязательно

export async function POST(request) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  // Диагностика — можно оставить на время отладки
  if (!token) {
    return NextResponse.json(
      { ok: false, error: 'Missing BLOB_READ_WRITE_TOKEN on server' },
      { status: 500 }
    );
  }

  try {
    return await handleUpload({
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        addRandomSuffix: true,
      }),
      onUploadCompleted: async ({ blob }) => {
        // Записываем URL в БД (не падаем, если БД недоступна)
        try {
          await sql`INSERT INTO photos (url, published) VALUES (${blob.url}, TRUE)`;
        } catch (dbErr) {
          console.error('DB insert failed:', dbErr);
        }
      },
      token, // <-- СЮДА ПЕРЕДАЁМ RW-токен
    });
  } catch (e) {
    console.error('upload route error:', e);
    // Пробрасываем понятный текст на клиент
    return NextResponse.json(
      { ok: false, error: e?.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

// Чтобы GET в браузере не пугал "405"
export async function GET() {
  const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;
  return NextResponse.json(
    { ok: false, hint: 'Use POST to upload files', hasBlobToken },
    { status: 405 }
  );
}
