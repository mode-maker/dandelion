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
      // 👉 ЯВНО передаём токен из env
      token: process.env.BLOB_READ_WRITE_TOKEN,

      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        addRandomSuffix: true,
      }),

      onUploadCompleted: async ({ blob }) => {
        await sql/* sql */`
          INSERT INTO photos (url, published)
          VALUES (${blob.url}, TRUE)
        `;
      },
    });

    return NextResponse.json({ ok: true, uploaded: result });
  } catch (err) {
    // лог в функции — увидишь его в Function Logs
    console.error('UPLOAD ERROR:', err);
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 400 });
  }
}
