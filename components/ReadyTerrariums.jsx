"use client";

import { useRef } from "react";
import Image from "next/image";
import { Manrope, Caveat } from "next/font/google";

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});
const caveat = Caveat({
  subsets: ["cyrillic", "latin"],
  weight: ["700"],
  display: "swap",
});

// демо-данные (фото положи в /public/ready/)
const ITEMS = [
  {
    title: "Лесное дыхание",
    img: "/ready/1.jpg",
    price: 1999,
    desc: "Природная гармония — свежесть зелени и лёгкость одуванчиков.",
  },
  {
    title: "Тёплое лето",
    img: "/ready/2.jpg",
    price: 1999,
    desc: "Яркие акценты природы, которые подарят уют и настроение дому.",
  },
  {
    title: "Оазис уюта",
    img: "/ready/3.jpg",
    price: 1999,
    desc: "Мини-сад, наполненный спокойствием и гармонией природы.",
  },
  {
    title: "Светлый день",
    img: "/ready/4.jpg",
    price: 1999,
    desc: "Живое украшение, создающее атмосферу тепла и вдохновения.",
  },
  {
    title: "Дом солнца",
    img: "/ready/5.jpg",
    price: 1999,
    desc: "Лаконичная композиция, наполняющая пространство светом и радостью.",
  },
  {
    title: "Мягкое золото",
    img: "/ready/6.jpg",
    price: 1999,
    desc: "Спокойные тёплые оттенки, которые создают мягкую, уютную атмосферу.",
  },
];

export default function ReadyTerrariums() {
  const scrollerRef = useRef(null);

  const scrollByCards = (dir = 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    // прокручиваем ровно на ширину 2 карточек
    const card = el.querySelector("[data-card]");
    const step = card ? card.clientWidth + 32 /*gap*/ : 360;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  return (
    <section className="py-14">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Заголовок блока */}
        <h2
          className={`${caveat.className} text-[#ECEDE8] text-[32px] md:text-[36px] text-center tracking-wide mb-6`}
        >
          ← ГОТОВЫЕ ФЛОРАРИУМЫ →
        </h2>

        <div className="relative">
          {/* подложка */}
          <div className="rounded-2xl bg-[#E7E8E0] shadow-[0_10px_28px_rgba(0,0,0,0.25)] px-6 py-6">
            {/* стрелки */}
            <button
              aria-label="Назад"
              onClick={() => scrollByCards(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10
                         rounded-full bg-black/35 hover:bg-black/50 text-white
                         backdrop-blur px-3 py-2 transition"
            >
              ←
            </button>
            <button
              aria-label="Вперёд"
              onClick={() => scrollByCards(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10
                         rounded-full bg-black/35 hover:bg-black/50 text-white
                         backdrop-blur px-3 py-2 transition"
            >
              →
            </button>

            {/* затемнение краёв (для красоты) */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 rounded-l-2xl
                            bg-gradient-to-r from-[#E7E8E0] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 rounded-r-2xl
                            bg-gradient-to-l from-[#E7E8E0] to-transparent" />

            {/* горизонтальная лента */}
            <div
              ref={scrollerRef}
              className="no-scrollbar overflow-x-auto scroll-smooth snap-x snap-mandatory"
            >
              <div className="flex gap-8 pr-4">
                {ITEMS.map((p, i) => (
                  <Card key={i} {...p} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({ title, img, desc, price }) {
  return (
    <article
      data-card
      className="snap-start flex-shrink-0 w-[320px] md:w-[340px] rounded-xl"
    >
      {/* Заголовок — был 22px → стал 24px */}
      <header className={`${manrope.className} text-[24px] font-semibold text-[#2b2b2b] mb-3`}>
        {title}
      </header>

      <div className="rounded-xl overflow-hidden shadow-[0_10px_22px_rgba(0,0,0,0.25)]">
        <Image
          src={img}
          alt={title}
          width={640}
          height={800}
          className="w-full h-[360px] object-cover"
          onError={(e) => {
            // @ts-ignore
            e.currentTarget.src = "/about/terrarium.jpg";
          }}
        />
      </div>

      {/* Описание — было 15px → стало 16px */}
      <p className="mt-3 text-[16px] leading-7 text-[#333]">
        {desc}
      </p>

      <div className="mt-3 flex items-center justify-between">
        {/* Цена — было 20px → стало 22px */}
        <div className={`${manrope.className} text-[22px] font-semibold text-[#1d1d1d]`}>
          {price}p
        </div>

        {/* Кнопка — больше, фон 3F3F3F, текст E7E8E0 */}
        <a
          href="https://t.me/yourtelegram"
          target="_blank"
          rel="noreferrer"
          className="rounded-md bg-[#3F3F3F] text-[#E7E8E0] px-5 py-2 text-[15px] md:text-[16px]
                     transition transform hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
        >
          Заказать
        </a>
      </div>
    </article>
  );
}
