import { sql } from '@vercel/postgres';

export async function GET() {
  const { rows } = await sql/* sql */`
    SELECT id, url, title, published, created_at
    FROM photos
    ORDER BY created_at DESC
    LIMIT 100
  `;
  return Response.json(rows);
}
