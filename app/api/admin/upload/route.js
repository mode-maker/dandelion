// app/api/admin/upload/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { handleUpload } from '@vercel/blob';        // серверный helper
import { sql } from '@vercel/postgres';

export async function POST(request) {
  try {
    // ВАЖНО: handleUpload ожидает JSON от клиента (его шлёт upload(...) из @vercel/blob/client)
    const body = await request.json();

    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        addRandomSuffix: true,
      }),
      onUploadCompleted: async ({ blob }) => {
        // создаём таблицу на всякий случай и пишем запись
        await sql`
          CREATE TABLE IF NOT EXISTS photos (
            id SERIAL PRIMARY KEY,
            url TEXT NOT NULL,
            published BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );`;

        await sql`INSERT INTO photos (url, published) VALUES (${blob.url}, TRUE)`;
      },
      // КРИТИЧНО: токен берём из env (работает только в nodejs runtime)
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ ok: true, uploaded: result });
  } catch (err) {
    console.error('UPLOAD ERROR:', err);
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 400 },
    );
  }
}

// (опционально, чтобы GET по этому роуту не давал 405 в логах)
export async function GET() {
  return NextResponse.json({ ok: true, info: 'Use POST with @vercel/blob/client upload()' });
}
