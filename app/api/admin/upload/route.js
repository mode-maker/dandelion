// app/api/admin/upload/route.js
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: 'Missing BLOB_READ_WRITE_TOKEN on server' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files');
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Нет файлов' }, { status: 400 });
    }

    const uploaded = [];

    for (const file of files) {
      // file: Blob from FormData
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const objectKey = `gallery/${Date.now()}-${file.name}`;
      const blob = await put(objectKey, buffer, {
        access: 'public',
        contentType: file.type || 'application/octet-stream',
        token, // RW-токен берем из ENV
      });

      uploaded.push({
        url: blob.url,
        pathname: blob.pathname,
        size: buffer.length,
        contentType: file.type || null,
      });

      // сохранить в БД (не валим загрузку при ошибке БД)
      try {
        await sql`INSERT INTO photos (url, published) VALUES (${blob.url}, TRUE)`;
      } catch (e) {
        console.error('DB insert failed:', e);
      }
    }

    return NextResponse.json({ ok: true, uploaded }, { status: 200 });
  } catch (e) {
    console.error('upload route error:', e);
    return NextResponse.json(
      { error: e.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { hint: 'Use POST to upload files' },
    { status: 405 }
  );
}
