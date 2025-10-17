"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

// Данные карточек
const ITEMS = [
  { title: "Флорариумы с суккулентами", img: "/workshops/1.jpg" },
  { title: "Тематические и сезонные",   img: "/workshops/2.jpg" },
  { title: "Композиции из сухоцветов",  img: "/workshops/3.jpg" },
  { title: "Детские мастер-классы",     img: "/workshops/4.jpg" },
  { title: "Выездные мастер-классы",    img: "/workshops/5.jpg" },
  // кадр слегка приподнят у 6-й
  { title: "Украшение помещений",       img: "/workshops/6.jpg", objPos: "object-[50%_35%]" },
];

export default function WorkshopsGrid() {
  const [modal, setModal] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setModal(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section
      id="workshops"
      className="py-14 transform-gpu will-change-[transform]"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-3 gap-10">
          {ITEMS.map((it, i) => (
            <Card key={i} item={it} onMore={() => setModal(it)} />
          ))}
        </div>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6"
          onClick={() => setModal(null)}
        >
          <div
            className="max-w-[720px] w-full rounded-2xl bg-[#EFE9DD] shadow-[0_6px_20px_rgba(0,0,0,0.35)] overflow-hidden transform-gpu"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2">
              <div className="p-8">
                <h3 className={`${manrope.className} text-xl font-semibold text-zinc-900`}>{modal.title}</h3>
                <p className="mt-4 text-[15px] leading-7 text-zinc-800">
                  {modal.desc ?? "Описание этого мастер-класса появится здесь."}
                </p>
                <button
                  className="mt-8 inline-flex items-center justify-center rounded-md px-4 py-2
                             bg-[#3F3F3F] text-[#E7E8E0] transition-transform transform-gpu will-change-[transform]
                             hover:-translate-y-0.5 active:translate-y-0"
                  onClick={() => setModal(null)}
                >
                  Закрыть
                </button>
              </div>
              <div className="relative min-h-[260px] rounded-r-2xl overflow-hidden -mr-px">
                <Image
                  src={modal.img}
                  alt={modal.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // next/image не даёт менять src напрямую; подстрахуемся запасным классом
                  }}
                  sizes="(min-width: 1024px) 360px, 100vw"
                  loading="eager"
                  priority={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Card({ item, onMore }) {
  return (
    <article
      className="
        space-y-3 rounded-xl bg-white/5
        shadow-[0_4px_14px_rgba(0,0,0,0.20)]
        p-3
        transform-gpu
      "
    >
      {/* Заголовок над изображением */}
      <div className="text-[#ECEDE8] text-[20px] font-semibold">
        {item.title}
      </div>

      {/* Фото: next/image + слабый drop-shadow вместо тяжёлой тени контейнера */}
      <div className="relative h-[240px] rounded-xl overflow-hidden">
        <Image
          src={item.img}
          alt={item.title}
          fill
          className={`object-cover ${item.objPos ?? "object-center"} drop-shadow`}
          sizes="(min-width: 1024px) 360px, 100vw"
          loading="lazy"
          priority={false}
        />
      </div>

      {/* Кнопки: только transform-анимации, без box-shadow-анимаций */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMore}
          className="
            rounded-md px-4 py-1.5 bg-[#E7E8E0] text-zinc-900
            transition-transform transform-gpu will-change-[transform]
            hover:-translate-y-0.5 active:translate-y-0
          "
        >
          Узнать больше
        </button>

        <a
          href="https://t.me/yourtelegram"
          target="_blank"
          rel="noreferrer"
          className="
            rounded-md px-4 py-1.5 bg-white/10 text-white/90 border border-white/20
            transition-transform transform-gpu will-change-[transform]
            hover:-translate-y-0.5 active:translate-y-0
          "
        >
          Записаться
        </a>
      </div>
    </article>
  );
}
