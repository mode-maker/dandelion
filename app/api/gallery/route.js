import { NextResponse } from "next/server";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const KEY   = process.env.CLOUDINARY_API_KEY;
const SEC   = process.env.CLOUDINARY_API_SECRET;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor") || "";
  const tag = searchParams.get("tag") || ""; // фильтр по тегу (опционально)

  const expressionParts = [
    "folder=events",     // из папки
    "tags=gallery"       // и помечены тегом
  ];
  if (tag) expressionParts.push(`tags=${tag}`);
  const expression = expressionParts.join(" AND ");

  const body = new URLSearchParams({
    expression,
    max_results: "30",
    sort_by: "created_at",
    direction: "desc",
  });
  if (cursor) body.set("next_cursor", cursor);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD}/resources/search`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " + Buffer.from(`${KEY}:${SEC}`).toString("base64"),
      },
      body,
      // небольшое кеширование (10 минут)
      next: { revalidate: 600 },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text }, { status: 500 });
  }
  const data = await res.json();
  // Оставим только то, что нужно фронту
  const items = (data.resources || []).map((r) => ({
    id: r.asset_id,
    publicId: r.public_id,
    w: r.width,
    h: r.height,
    // авто-трансформации webp + умный кроп
    thumb: `https://res.cloudinary.com/${CLOUD}/image/upload/c_fill,q_auto,f_auto,w_600/${r.public_id}.jpg`,
    full:  `https://res.cloudinary.com/${CLOUD}/image/upload/q_auto,f_auto/${r.public_id}.jpg`,
    tags: r.tags,
    createdAt: r.created_at,
  }));
  return NextResponse.json({
    items,
    nextCursor: data.next_cursor || null,
  });
}
