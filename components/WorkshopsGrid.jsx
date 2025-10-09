"use client";

import { useState, useEffect } from "react";

// данные карточек (при желании поменяешь названия и пути к фото)
const ITEMS = [
  { title: "Флорариумы с суккулентами", img: "/workshops/1.jpg",
    desc: "Практический мастер-класс по созданию флорариума с суккулентами. Обсудим уход и композицию." },
  { title: "Тематические и сезонные", img: "/workshops/2.jpg",
    desc: "Делаем флорариумы к праздникам и сезонам. Идеи, стили и материалы." },
  { title: "Композиции из сухоцветов", img: "/workshops/3.jpg",
    desc: "Учимся работать с сухоцветами и создавать устойчивые композиции в стекле." },
  { title: "Детские мастер-классы", img: "/workshops/4.jpg",
    desc: "Безопасный и увлекательный формат для детей: создаём свой маленький мир." },
  { title: "Выездные мастер-классы", img: "/workshops/5.jpg",
    desc: "Проведём мастер-класс на вашей площадке: корпоративы, праздники, частные события." },
  { title: "Украшение помещений", img: "/workshops/6.jpg",
    desc: "Флористические решения и оформление пространства под задачу и бюджет." },
];

export default function WorkshopsGrid() {
  const [modal, setModal] = useState(null); // {title, desc, img} | null

  // закрытие по Esc
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setModal(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section className="py-14">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* сетка 3х2 на десктопе */}
        <div className="grid grid-cols-3 gap-10">
          {ITEMS.map((it, i) => (
            <Card key={i} item={it} onMore={() => setModal(it)} />
          ))}
        </div>
      </div>

      {/* Modal */}
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
                <p className="mt-4 text-[15px] leading-7 text-zinc-800">{modal.desc}</p>
                <button
                  className="mt-8 inline-flex items-center justify-center rounded-md border border-zinc-300 px-4 py-2
                             bg-white/80 text-zinc-800 transition hover:-translate-y-0.5 hover:bg-white
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
      {/* картинка */}
      <div className="rounded-xl overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.25)]">
        <img
          src={item.img}
          alt={item.title}
          onError={(e) => { e.currentTarget.src = "/about/terrarium.jpg"; }}
          className="block w-full h-[240px] object-cover"
        />
      </div>

      {/* заголовок */}
      <div className="text-[#ECEDE8] text-[18px] font-semibold">
        {item.title}
      </div>

      {/* кнопки */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMore}
          className="rounded-md border border-white/40 bg-white/20 text-white/90 px-4 py-1.5
                     backdrop-blur-[2px] transition transform hover:-translate-y-0.5
                     hover:bg-white/30 hover:shadow-md active:translate-y-0"
        >
          Узнать больше
        </button>

        <a
          href="https://t.me/yourtelegram" target="_blank" rel="noreferrer"
          className="rounded-md border border-white/40 bg-white/20 text-white/90 px-4 py-1.5
                     backdrop-blur-[2px] transition transform hover:-translate-y-0.5
                     hover:bg-white/30 hover:shadow-md active:translate-y-0"
        >
          Записаться
        </a>
      </div>
    </div>
  );
}
