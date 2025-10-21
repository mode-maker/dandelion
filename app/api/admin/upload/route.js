// app/api/admin/upload/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { handleUpload } from '@vercel/blob/client';
import { sql } from '@vercel/postgres';

export async function POST(request) {
  try {
    const body = await request.json();

    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        addRandomSuffix: true,
      }),
      onUploadCompleted: async ({ blob }) => {
        // создаем таблицу при первом аплоаде
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
      // важное место: токен берем из переменных окружения
      token: process.env.BLOB_READ_WRITE_TOKEN,
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
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  return NextResponse.json(
    { ok: false, error: 'BLOB_READ_WRITE_TOKEN env var is missing' },
    { status: 500 }
  );
}
