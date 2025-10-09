"use client";

import { useState, useEffect } from "react";

// Данные карточек (можешь править заголовки/пути к фото)
const ITEMS = [
  { title: "Флорариумы с суккулентами", img: "/workshops/1.jpg" },
  { title: "Тематические и сезонные",   img: "/workshops/2.jpg" },
  { title: "Композиции из сухоцветов",  img: "/workshops/3.jpg" },
  { title: "Детские мастер-классы",     img: "/workshops/4.jpg" },
  { title: "Выездные мастер-классы",    img: "/workshops/5.jpg" },
  // 6-я карточка — поднимаем кадр: объект-позиция 50% по X и 35% по Y
  { title: "Украшение помещений",       img: "/workshops/6.jpg", objPos: "object-[50%_35%]" },
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
    <section className="py-14">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-3 gap-10">
          {ITEMS.map((it, i) => (
            <Card key={i} item={it} onMore={() => setModal(it)} />
          ))}
        </div>
      </div>

      {/* Модалка "Узнать больше" */}
      {modal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-6"
          onClick={() => setModal(null)}
        >
          <div
            className="max-w-[720px] w-full rounded-2xl bg-[#EFE9DD] shadow-[8px_8px_24px_rgba(0,0,0,0.35)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2">
              <div className="p-8">
                <h3 className="text-xl font-semibold text-zinc-900">{modal.title}</h3>
                <p className="mt-4 text-[15px] leading-7 text-zinc-800">
                  {modal.desc ?? "Описание этого мастер-класса появится здесь."}
                </p>
                <button
                  className="mt-8 inline-flex items-center justify-center rounded-md px-4 py-2
                             bg-[#E7E8E0] text-zinc-900 transition hover:-translate-y-0.5
                             hover:shadow-md active:translate-y-0"
                  onClick={() => setModal(null)}
                >
                  Закрыть
                </button>
              </div>
              <div className="h-full min-h-[260px] overflow-hidden rounded-r-2xl -mr-px">
                <img
                  src={modal.img}
                  alt={modal.title}
                  onError={(e) => { e.currentTarget.src = "/about/terrarium.jpg"; }}
                  className="block w-full h-full object-cover"
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
      {/* 1) Заголовок НАД изображением */}
      <div className="text-[#ECEDE8] text-[22px] font-semibold">
        {item.title}
      </div>

      {/* 2) Фото — одинаковая высота, скругления и тень */}
      <div className="rounded-xl overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.25)]">
        <img
          src={item.img}
          alt={item.title}
          onError={(e) => { e.currentTarget.src = "/about/terrarium.jpg"; }}
          className={`block w-full h-[240px] object-cover ${item.objPos ?? "object-center"}`}
        />
      </div>

      {/* 3–4) Кнопки с нужными стилями */}
      <div className="flex items-center gap-3">
        {/* Узнать больше: без обводки, заливка E7E8E0, чёрный текст */}
        <button
          onClick={onMore}
          className="rounded-md px-4 py-1.5 bg-[#E7E8E0] text-zinc-900
                     transition transform hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
        >
          Узнать больше
        </button>

        {/* Записаться: более прозрачная */}
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
