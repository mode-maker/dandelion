"use client";

import Image from "next/image";
import { useState } from "react";
import { Caveat, Manrope } from "next/font/google";

const caveat = Caveat({ subsets: ["latin", "cyrillic"], weight: ["700"] });
const manrope = Manrope({ subsets: ["latin", "cyrillic"], weight: ["400", "600"] });

const REVIEWS = [
  {
    id: 1,
    name: "Анна",
    role: "Заказ: флорариум в подарок",
    photo: "/reviews/1.jpg",
    short:
      "Очень нежная работа, аккуратно упаковали и доставили вовремя.",
    full:
      "Заказывала флорариум в подарок. Понравилось всё: от общения до финальной композиции. Цвета и фактура подобраны со вкусом, видно любовь к делу. Доставка чёткая, упаковка надёжная. Обязательно вернусь за новым заказом!"
  },
  {
    id: 2,
    name: "Марина",
    role: "Мастер-класс по суккулентам",
    photo: "/reviews/2.jpg",
    short:
      "На мастер-классе было легко и интересно, унесла домой готовую композицию.",
    full:
      "Спасибо за атмосферный мастер-класс. Всё объяснили простым языком, помогали на каждом шаге. Ушла с готовой композицией и базовыми знаниями по уходу. Отличное время и полезный опыт!"
  },
  {
    id: 3,
    name: "Олег",
    role: "Оформление мероприятия",
    photo: "/reviews/3.jpg",
    short:
      "Оформление зала — вау-эффект, гости спрашивали контакты студии.",
    full:
      "Команда Dandelion очень гибкая: быстро предложили концепт, сделали смету и всё реализовали в срок. Живые акценты, чистые линии, красиво и без лишнего. Спасибо за профессионализм!"
  }
];

export default function Reviews() {
  const [active, setActive] = useState(null);

  return (
    <section id="reviews" className="w-full px-8 xl:px-16 2xl:px-24 py-24">
      <div className="max-w-7xl mx-auto">
        <h2 className={`${caveat.className} text-5xl leading-none mb-10 text-[#E7E8E0] text-center`}>
           Отзывы
         </h2>
          Отзывы
        </h2>

        <div className="grid grid-cols-3 gap-6">
          {REVIEWS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item)}
              className="group text-left rounded-2xl overflow-hidden bg-[#E7E8E0] hover:shadow-xl transition-shadow"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image src={item.photo} alt={item.name} fill className="object-cover" />
              </div>

              <div className="p-6">
                <div className={`${manrope.className} text-sm uppercase tracking-wide text-[#3F3F3F]/80`}>
                  {item.role}
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <div className={`${caveat.className} text-3xl text-[#1E1F1A]`}>
                    {item.name}
                  </div>
                  <span className={`${manrope.className} text-[#3F3F3F]`}>
                    Читать
                  </span>
                </div>
                <p className={`${manrope.className} mt-4 text-[#3F3F3F]`}>
                  {item.short}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
          onClick={() => setActive(null)}
        >
          <div
            className="relative w-full max-w-[960px] rounded-2xl overflow-hidden bg-[#E7E8E0]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-[16/9]">
              <Image src={active.photo} alt={active.name} fill className="object-cover" />
            </div>

            <div className="p-8">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className={`${caveat.className} text-4xl text-[#1E1F1A]`}>
                    {active.name}
                  </div>
                  <div className={`${manrope.className} mt-1 text-sm uppercase tracking-wide text-[#3F3F3F]/80`}>
                    {active.role}
                  </div>
                </div>

                <button
                  onClick={() => setActive(null)}
                  className="shrink-0 rounded-full px-4 py-2 bg-[#3F3F3F] text-[#E7E8E0]"
                >
                  Закрыть
                </button>
              </div>

              <p className={`${manrope.className} mt-6 text-[#3F3F3F]`}>
                {active.full}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
