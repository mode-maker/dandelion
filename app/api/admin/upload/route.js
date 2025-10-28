// app/api/admin/upload/route.js
import { NextResponse } from 'next/server';
import { handleUpload } from '@vercel/blob/client';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { ok: false, error: 'Missing BLOB_READ_WRITE_TOKEN on server' },
      { status: 500 }
    );
  }

  // ВАЖНО: прочитать тело и передать в handleUpload
  const body = await request.json();

  try {
    return await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        addRandomSuffix: true,
      }),
      onUploadCompleted: async ({ blob }) => {
        // Не роняем загрузку, если БД недоступна
        try {
          await sql`INSERT INTO photos (url, published) VALUES (${blob.url}, TRUE)`;
        } catch (e) {
          console.error('DB insert failed:', e);
        }
      },
      token, // сюда передаём RW-токен из ENV
    });
  } catch (e) {
    console.error('upload route error:', e);
    return NextResponse.json(
      { ok: false, error: e?.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;
  return NextResponse.json(
    { ok: false, hint: 'Use POST to upload files', hasBlobToken },
    { status: 405 }
  );
}
