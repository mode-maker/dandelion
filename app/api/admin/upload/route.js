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
      token: process.env.BLOB_READ_WRITE_TOKEN,   // <- явный токен
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

    // ВАЖНО: вернуть именно result, без обёртки!
    return NextResponse.json(result);

  } catch (err) {
    console.error('UPLOAD ERROR:', err);
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 400 }
    );
  }
}
