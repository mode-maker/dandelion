// app/api/gallery/route.js
import { NextResponse } from "next/server";

// Внимание: должны быть заданы переменные окружения на Vercel:
// NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
// CLOUDINARY_API_KEY
// CLOUDINARY_API_SECRET

export const dynamic = "force-dynamic"; // не кэшировать, чтобы новые фото были сразу
export const revalidate = 0;

export async function GET() {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud || !key || !secret) {
    return NextResponse.json(
      { error: "Cloudinary env vars are missing" },
      { status: 500 }
    );
  }

  // Ищем все изображения из папки events (и, если есть, с тегом gallery)
  // Если хочешь фильтровать только по тегу: expression: 'resource_type:image AND tags=gallery'
  const body = {
    expression: "resource_type:image AND folder=events", // + " AND tags=gallery" при желании
    sort_by: [{ created_at: "desc" }],
    max_results: 100,
  };

  const url = `https://api.cloudinary.com/v1_1/${cloud}/resources/search`;
  const auth = "Basic " + Buffer.from(`${key}:${secret}`).toString("base64");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      // на всякий случай отключим кэш CDN
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Cloudinary search failed", details: text },
        { status: 500 }
      );
    }

    const data = await res.json();
    const items =
      (data.resources || []).map((r) => ({
        id: r.public_id,
        url: r.secure_url,
        w: r.width,
        h: r.height,
        created_at: r.created_at,
        tags: r.tags || [],
      })) || [];

    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json(
      { error: "Unexpected error", details: String(e) },
      { status: 500 }
    );
  }
}
