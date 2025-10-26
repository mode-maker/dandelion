// app/api/admin/upload/route.js
import { NextResponse } from 'next/server';
import { handleUpload } from '@vercel/blob/client';
import { sql } from '@vercel/postgres';

// 1) Гарантируем Node.js среду (а не Edge)
export const runtime = 'nodejs';

// 2) Не даём роуту стать статическим/кешируемым
export const dynamic = 'force-dynamic';

// (не обязательно, но удобно для явного поведения)
// export const revalidate = 0;

export async function POST(request) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { ok: false, error: 'Missing BLOB_READ_WRITE_TOKEN' },
      { status: 500 }
    );
  }

  // handleUpload сам прочитает body и отдаст корректный ответ клиенту
  return handleUpload({
    request,
    onBeforeGenerateToken: async () => ({
      allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
      addRandomSuffix: true,
    }),
    onUploadCompleted: async ({ blob }) => {
      try {
        await sql`INSERT INTO photos (url, published) VALUES (${blob.url}, TRUE)`;
      } catch (e) {
        console.error('DB insert failed:', e);
      }
    },
    token, // — вот сюда и передаём RW-токен из env
  });
}

// Чтобы в браузере GET не пугал «This page isn’t working»
export async function GET() {
  return NextResponse.json(
    { ok: false, error: 'Use POST to upload files' },
    { status: 405 }
  );
}
