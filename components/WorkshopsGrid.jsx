"use client";

import { useState, useEffect } from "react";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  weight: ["600", "700"],
  display: "swap",
});

// ЕДИНЫЕ габариты поп-апа (меняй тут при необходимости)
const MODAL_W = 880;  // ширина окна (px)
const MODAL_H = 420;  // высота окна (px)

// Данные карточек
const ITEMS = [
  {
    title: "Флорариумы с суккулентами",
    img: "/workshops/1.jpg",
    desc:
      "Практический мастер-класс по созданию флорариума с суккулентами. Разберём композицию, грунты и уход.",
  },
  {
    title: "Тематические и сезонные",
    img: "/workshops/2.jpg",
    desc:
      "Идеи для праздников и сезонов. Подбор декора, стили и цветовые решения.",
  },
  {
    title: "Композиции из сухоцветов",
    img: "/workshops/3.jpg",
    desc:
      "Работаем с сухоцветами и создаём устойчивые композиции в стекле.",
  },
  {
    title: "Детские мастер-классы",
    img: "/workshops/4.jpg",
    desc:
      "Безопасный формат для детей: создаём свой маленький мир, изучаем растения.",
  },
  {
    title: "Выездные мастер-классы",
    img: "/workshops/5.jpg",
    desc:
      "Проведём мастер-класс у вас: корпоратив, праздник или частное событие.",
  },
  {
    title: "Украшение помещений",
    img: "/workshops/6.jpg",
    objPos: "object-[50%_35%]", // кадр слегка приподнят
    desc:
      "Флористические решения и оформление пространства под задачу и бюджет.",
  },
];

export default function WorkshopsGrid() {
  const [modal, setModal] = useState(null);

  // Закрытие модалки по Esc
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setModal(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section className="py-14">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-3 gap-10">
          {ITEMS.map((it, i) => (
            <Card key={i} item={it} onMore={() => setModal(it)} />
          ))}
        </div>
      </div>

      {/* ЕДИНЫЙ ПОП-АП */}
      {modal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-6"
          onClick={() => setModal(null)}
        >
          <div
            className={`rounded-2xl bg-[#EFE9DD] shadow-[8px_8px_24px_rgba(0,0,0,0.35)] overflow-hidden`}
            style={{ width: MODAL_W, height: MODAL_H }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* две колонки одинаковой высоты */}
            <div className="grid grid-cols-2 h-full">
              {/* Левая часть — контент, выровнен по вертикали */}
              <div className="h-full p-8 flex flex-col">
                <h3 className={`${manrope.className} text-2xl font-semibold text-zinc-900`}>
                  {modal.title}
                </h3>
                <p className="mt-4 text-[15px] leading-7 text-zinc-800">
                  {modal.desc ?? "Описание этого мастер-класса появится здесь."}
                </p>

                <div className="mt-auto pt-6">
                  <button
                    className="inline-flex items-center justify-center rounded-md px-4 py-2
                               bg-[#E7E8E0] text-zinc-900 transition hover:-translate-y-0.5
                               hover:shadow-md active:translate-y-0"
                    onClick={() => setModal(null)}
                  >
                    Закрыть
                  </button>
                </div>
              </div>

              {/* Правая часть — картинка, строго под размер MODAL_H */}
              <div className="relative h-full overflow-hidden rounded-r-2xl -mr-px">
                <img
                  src={modal.img}
                  alt={modal.title}
                  onError={(e) => { e.currentTarget.src = "/about/terrarium.jpg"; }}
                  className={`block w-full h-full object-cover ${modal.objPos ?? "object-center"}`}
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
    <div className="space-y-3">
      {/* Заголовок над изображением — Manrope */}
      <div className={`${manrope.className} text-[#ECEDE8] text-[21px] font-semibold`}>
        {item.title}
      </div>

      {/* Превью-фото */}
      <div className="rounded-xl overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.25)]">
        <img
          src={item.img}
          alt={item.title}
          onError={(e) => { e.currentTarget.src = "/about/terrarium.jpg"; }}
          className={`block w-full h-[240px] object-cover ${item.objPos ?? "object-center"}`}
        />
      </div>

      {/* Кнопки */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMore}
          className="rounded-md px-4 py-1.5 bg-[#E7E8E0] text-zinc-900
                     transition transform hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
        >
          Узнать больше
        </button>

        <a
          href="https://t.me/yourtelegram"
          target="_blank"
          rel="noreferrer"
          className="rounded-md px-4 py-1.5 bg-white/10 text-white/90 border border-white/25
                     transition transform hover:-translate-y-0.5 hover:bg-white/20 active:translate-y-0"
        >
          Записаться
        </a>
      </div>
    </div>
  );
}
