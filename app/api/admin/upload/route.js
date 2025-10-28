import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');
    if (!files || !files.length) {
      return NextResponse.json({ error: 'Нет файлов' }, { status: 400 });
    }

    const results = [];
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const blob = await put(`gallery/${file.name}`, buffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: file.type,
      });

      results.push(blob.url);

      // Добавляем в БД (если хочешь)
      try {
        await sql`INSERT INTO photos (url, published) VALUES (${blob.url}, TRUE)`;
      } catch (e) {
        console.error('DB insert failed:', e);
      }
    }

    return NextResponse.json({ ok: true, uploaded: results });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ hint: 'Use POST to upload files' }, { status: 405 });
}
