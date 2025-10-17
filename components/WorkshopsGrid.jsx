"use client";

import { useState, useEffect } from "react";
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

// Карточки с описаниями (desc) для модалки
const ITEMS = [
  {
    title: "Флорариумы с суккулентами",
    img: "/workshops/1.jpg",
    desc:
      "На мастер-классе вы узнаете, как собрать флорариум с суккулентами и декоративной зеленью. Это не только красивое украшение дома, но и уникальный опыт творчества, где каждый создаёт собственный живой мир.",
  },
  {
    title: "Тематические и сезонные",
    img: "/workshops/2.jpg",
    desc:
      "Новогодние венки и ёлочки из нобилиса, цветочные сюрпризы ко Дню матери, Пасхальные композиции или оригинальные идеи для Хэллоуина — каждый праздник станет особенным, если украсить его созданной своими руками композицией.",
  },
  {
    title: "Композиции из сухоцветов",
    img: "/workshops/3.jpg",
    desc:
      "Научитесь создавать стильные и долговечные композиции из сухоцветов. Они не требуют ухода и будут радовать вас долгие месяцы, украшая интерьер и придавая ему уют.",
  },
  {
    title: "Детские мастер-классы",
    img: "/workshops/4.jpg",
    desc:
      "Увлекательные занятия для детей, где они смогут создать свой первый флорариум или праздничную композицию. Всё проходит в игровой форме, с простыми материалами и в безопасной атмосфере.",
  },
  {
    title: "Выездные мастер-классы",
    img: "/workshops/5.jpg",
    desc:
      "Хотите украсить корпоратив, день рождения или дружескую вечеринку? Мы организуем мастер-класс прямо на вашей площадке — с материалами, инструкторами и неповторимой атмосферой.",
  },
  {
    title: "Цветочно-сладкие боксы",
    img: "/workshops/6.jpg",
    objPos: "object-[50%_35%]",
    desc:
      "На мастер-классе мы научим собирать уникальные композиции, где сочетаются свежие цветы и сладости. Такой бокс станет незабываемым подарком для близких или ярким украшением праздника.",
  },
];

export default function WorkshopsGrid() {
  const [modal, setModal] = useState(null);

  // закрытие модалки по Esc
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setModal(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section id="workshops" className="py-14 scroll-mt-24 lg:scroll-mt-28">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Заголовок блока */}
        <h2
          className={`${caveat.className} text-[#ECEDE8] text-[32px] md:text-[36px] tracking-wide text-center mb-8`}
        >
          СОЗДАЙ КРАСОТУ СВОИМИ РУКАМИ
        </h2>

        {/* Сетка карточек */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {ITEMS.map((it, i) => (
            <Card key={i} item={it} onMore={() => setModal(it)} />
          ))}
        </div>
      </div>

      {/* Модалка */}
      {modal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6"
          onClick={() => setModal(null)}
        >
          <div
            className="max-w-[720px] w-full rounded-2xl bg-[#EFE9DD] shadow-[0_6px_20px_rgba(0,0,0,0.35)] overflow-hidden transform-gpu"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8">
                <h3 className={`${manrope.className} text-xl font-semibold text-zinc-900`}>
                  {modal.title}
                </h3>
                <p className="mt-4 text-[15px] leading-7 text-zinc-800">
                  {modal.desc}
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

              <div className="relative min-h-[260px] rounded-b-2xl md:rounded-b-none md:rounded-r-2xl overflow-hidden -mr-px">
                <Image
                  src={modal.img}
                  alt={modal.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 360px, 100vw"
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
        p-3 transform-gpu
      "
    >
      {/* Заголовок */}
      <div className="text-[#ECEDE8] text-[20px] font-semibold">
        {item.title}
      </div>

      {/* Фото */}
      <div className="relative h-[240px] rounded-xl overflow-hidden">
        <Image
          src={item.img}
          alt={item.title}
          fill
          className={`object-cover ${item.objPos ?? "object-center"} drop-shadow`}
          sizes="(min-width: 1024px) 360px, 100vw"
          loading="lazy"
        />
      </div>

      {/* Кнопки */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMore}
          className="rounded-md px-4 py-1.5 bg-[#E7E8E0] text-zinc-900
                     transition-transform transform-gpu will-change-[transform]
                     hover:-translate-y-0.5 active:translate-y-0"
        >
          Узнать больше
        </button>

        <a
          href="https://t.me/yourtelegram"
          target="_blank"
          rel="noreferrer"
          className="rounded-md px-4 py-1.5 bg-white/10 text-white/90 border border-white/20
                     transition-transform transform-gpu will-change-[transform]
                     hover:-translate-y-0.5 active:translate-y-0"
        >
          Записаться
        </a>
      </div>
    </article>
  );
}
