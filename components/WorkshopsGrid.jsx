"use client";

import { useState, useEffect } from "react";
import { Manrope, Caveat } from "next/font/google";

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  weight: ["600", "700"],
  display: "swap",
});

const caveat = Caveat({
  subsets: ["cyrillic", "latin"],
  weight: ["700"],
  display: "swap",
});

// ЕДИНЫЕ габариты поп-апа
const MODAL_W = 880;
const MODAL_H = 420;

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
      "Научитесь создавать стильные и долговечные композиции из сухоцветов. Они не требуют ухода и будут радовать вас долгие месяцы, украшая интерьер и придавая ему уют. Вы узнаете, как подбирать оттенки и формы, чтобы композиция гармонично вписывалась в любой интерьер.",
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
    title: "Украшение помещений",
    img: "/workshops/6.jpg",
    objPosCard: "object-[50%_85%]",   // в карточке показываем нижнюю часть кадра
    objPosModal: "object-[50%_75%]",  // в поп-апе кадр немного приподнят
    desc:
      "На мастер-классе мы научим собирать уникальные композиции, где сочетаются свежие цветы и сладости. Такой бокс станет незабываемым подарком для близких или ярким украшением праздника.",
  },
];

export default function WorkshopsGrid() {
  const [modal, setModal] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setModal(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section className="py-14">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* НАЗВАНИЕ БЛОКА */}
        <h2
          className={`${caveat.className} text-[#ECEDE8] text-[32px] md:text-[36px] text-center tracking-wide mb-8`}
        >
          СОЗДАЙ КРАСОТУ СВОИМИ РУКАМИ
        </h2>

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
            className="rounded-2xl bg-[#EFE9DD] shadow-[8px_8px_24px_rgba(0,0,0,0.35)] overflow-hidden"
            style={{ width: MODAL_W, height: MODAL_H }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 h-full">
              {/* Текст */}
              <div className="h-full p-8 flex flex-col">
                <h3 className={`${manrope.className} text-[24px] font-semibold text-zinc-900`}>
                  {modal.title}
                </h3>
                <p className="mt-4 text-[16px] leading-7 text-zinc-800">
                  {modal.desc ?? "Описание этого мастер-класса появится здесь."}
                </p>

                <div className="mt-auto pt-6">
                  <button
                    className="inline-flex items-center justify-center rounded-md px-4 py-2 text-[14px]
                               bg-[#3F3F3F] text-[#E7E8E0] transition hover:-translate-y-0.5
                               hover:shadow-md active:translate-y-0"
                    onClick={() => setModal(null)}
                  >
                    Закрыть
                  </button>
                </div>
              </div>

              {/* Фото */}
              <div className="relative h-full overflow-hidden rounded-r-2xl -mr-px">
                <img
                  src={modal.img}
                  alt={modal.title}
                  onError={(e) => { e.currentTarget.src = "/about/terrarium.jpg"; }}
                  className={`block w-full h-full object-cover ${modal.objPosModal ?? "object-center"}`}
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
      {/* Заголовок карточки — 22px */}
      <div className={`${manrope.className} text-[#ECEDE8] text-[22px] font-semibold`}>
        {item.title}
      </div>

      {/* Превью-фото */}
      <div className="rounded-xl overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.25)]">
        <img
          src={item.img}
          alt={item.title}
          onError={(e) => { e.currentTarget.src = "/about/terrarium.jpg"; }}
          className={`block w-full h-[240px] object-cover ${item.objPosCard ?? "object-center"}`}
        />
      </div>

      {/* Кнопки — 14px */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMore}
          className="rounded-md px-4 py-1.5 text-[14px] bg-[#E7E8E0] text-zinc-900
                     transition transform hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
        >
          Узнать больше
        </button>

        <a
          href="https://t.me/yourtelegram"
          target="_blank"
          rel="noreferrer"
          className="rounded-md px-4 py-1.5 text-[14px] bg-white/10 text-white/90 border border-white/25
                     transition transform hover:-translate-y-0.5 hover:bg-white/20 active:translate-y-0"
        >
          Записаться
        </a>
      </div>
    </div>
  );
}
