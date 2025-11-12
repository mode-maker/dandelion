"use client";

import Image from "next/image";
import { useState } from "react";
import { Caveat } from "next/font/google";

const caveat = Caveat({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
});

const REVIEWS = [
  {
    id: 1,
    name: "Анна К.",
    role: "Заказ флорариума в подарок",
    photo: "/reviews/anna.jpg",
    rating: 5,
    short:
      "Очень понравился флорариум — аккуратно собран, растения здоровые. Упаковка нарядная!",
    full:
      "Очень понравился флорариум — аккуратно собран, растения здоровые, композиция продумана. Упаковка была нарядной, подарить было приятно. Доставка вовремя, общение — вежливое. Обязательно вернусь ещё!",
  },
  {
    id: 2,
    name: "Диана П.",
    role: "Мастер-класс выходного дня",
    photo: "/reviews/diana.jpg",
    rating: 5,
    short:
      "Классная атмосфера и понятные объяснения. Ушла с красивой композицией!",
    full:
      "Классная атмосфера и понятные объяснения на мастер-классе. Даже без опыта всё получилось: ушёл с красивой композицией и пониманием, как ухаживать за растениями. Спасибо команде Dandelion!",
  },
  {
    id: 3,
    name: "Мария Л.",
    role: "Готовый флорариум для интерьера",
    photo: "/reviews/maria.jpg",
    rating: 4,
    short:
      "Вписался в интерьер, цвета и фактуры супер. Дали памятку по уходу.",
    full:
      "Флорариум идеально вписался в интерьер, понравился подбор растений и камней — цвета и фактуры очень гармоничные. Дали памятку по уходу, всё понятно. Спасибо!",
  },
];

const PHOTO_REVIEWS = [
  {
    id: "gallery-1",
    photo: "/reviews/gallery-1.jpg",
    alt: "Флорариум с сочными оттенками зелени и камнями в стеклянной вазе",
    width: 1001,
    height: 1280,
  },
  {
    id: "gallery-2",
    photo: "/reviews/gallery-2.jpg",
    alt: "Круглый флорариум с разноуровневой композицией суккулентов",
    width: 977,
    height: 1280,
  },
  {
    id: "gallery-3",
    photo: "/reviews/gallery-3.jpg",
    alt: "Мини-сад с цветущим растением и декоративными элементами",
    width: 720,
    height: 1280,
  },
];

function Stars({ count }) {
  return (
    <div className="flex gap-1" aria-label={`Оценка: ${count} из 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          className={`h-5 w-5 ${i < count ? "fill-yellow-400" : "fill-gray-400/40"}`}
          aria-hidden="true"
        >
          <path d="M10 15.27 15.18 18l-1.64-5.03L18 9.24l-5.19-.04L10 4 7.19 9.2 2 9.24l4.46 3.73L4.82 18 10 15.27z" />
        </svg>
      ))}
    </div>
  );
}

export default function Reviews() {
  const [opened, setOpened] = useState(null);

  return (
    <section id="reviews" className="relative py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2
          className={`${caveat.className} text-center text-4xl md:text-5xl font-bold tracking-tight`}
          style={{ color: "#E7E8E0" }}
        >
          Отзывы
        </h2>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {REVIEWS.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl bg-[#E7E8E0] shadow-sm overflow-hidden flex flex-col"
            >
              <Image
                src={r.photo}
                alt={`${r.name} — ${r.role}`}
                width={640}
                height={640}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="h-auto w-full object-cover"
                priority
              />
              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-[#222]">
                      {r.name}
                    </h3>
                    <p className="text-sm text-[#3F3F3F]">{r.role}</p>
                  </div>
                  <Stars count={r.rating} />
                </div>
                <p className="text-base leading-relaxed text-[#1f1f1f]">
                  {r.short}
                </p>
                <div className="mt-2">
                  <button
                    onClick={() => setOpened(r)}
                    className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
                    style={{ backgroundColor: "#3F3F3F", color: "#E7E8E0" }}
                  >
                    Читать полностью
                  </button>
                </div>
              </div>
            </article>
          ))}
          {PHOTO_REVIEWS.map((photo) => (
            <article
              key={photo.id}
              className="rounded-2xl overflow-hidden"
            >
                <Image
                  src={photo.photo}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  priority
                />

            </article>
          ))}
        </div>
      </div>

      {opened && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpened(null)}
          />
          <div className="relative z-10 w-full max-w-xl rounded-2xl overflow-hidden">
            <div className="relative h-56 w-full">
              <Image
                src={opened.photo}
                alt={opened.name}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            </div>
            <div className="bg-white p-6 md:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold text-[#222]">
                    {opened.name}
                  </h3>
                  <p className="text-sm text-[#3F3F3F]">{opened.role}</p>
                </div>
                <Stars count={opened.rating} />
              </div>
              <p className="mt-4 text-base leading-relaxed text-[#1f1f1f]">
                {opened.full}
              </p>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setOpened(null)}
                  className="rounded-xl px-5 py-2 text-sm font-medium"
                  style={{ backgroundColor: "#3F3F3F", color: "#E7E8E0" }}
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
