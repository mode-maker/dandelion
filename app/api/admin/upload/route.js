// app/api/admin/upload/route.js
import { NextResponse } from 'next/server';
import { handleUpload } from '@vercel/blob/client';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  // Прочитаем тело один раз (и используем его ниже)
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  // 🔎 ПРОБНИК: если пришёл probe — просто подтвердим, что POST доходит до сервера
  if (body && body.__probe === true) {
    return NextResponse.json({
      ok: true,
      probe: 'POST reached /api/admin/upload',
      hasBlobToken: !!token,
    });
  }

  if (!token) {
    return NextResponse.json(
      { ok: false, error: 'Missing BLOB_READ_WRITE_TOKEN on server' },
      { status: 500 }
    );
  }

  try {
    // ⚠️ ВАЖНО: передаём request И body в handleUpload
    return await handleUpload({
      request,
      body,
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
      token,
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
