"use client";

import Image from "next/image";
import { useState } from "react";
import { Caveat, Manrope } from "next/font/google";

const caveat = Caveat({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});
const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export default function Impressions() {
  const [src, setSrc] = useState("/about/terrarium.jpg");

  return (
    <section className="py-12">
      {/* СУЖАЕМ общий контейнер: было max-w-[1200px], стало 1040 */}
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Карточка: оставили тот же радиус и тень */}
        <div className="rounded-2xl overflow-hidden bg-[#EFE9DD] shadow-[8px_8px_15.5px_rgba(0,0,0,0.3)]">
          {/* Делаем пропорции 1.15 / 0.85 чтобы оба блока визуально компактнее смотрелись */}
          <div className="grid grid-cols-[1.15fr_0.85fr]">
            {/* Текст — меньше внутренние отступы */}
            <div className="p-8">
              <h2 className={`${caveat.className} text-[39px] leading-tight mb-5`}>
                ВПЕЧАТЛЕНИЯ, КОТОРЫЕ<br />ОСТАНУТСЯ В ПАМЯТИ
              </h2>

              <div className={`${manrope.className} text-[19px] leading-7 text-zinc-800 space-y-4`}>
                <p>
                  Мы проводим мастер-классы, создаём уникальные флорариумы и делаем
                  мероприятия особенными. Уже более 2 лет мы помогаем людям открыть для
                  себя мир миниатюрных садов в стекле.
                </p>
                <p>
                  За это время у нас сотни довольных гостей, десятки уютных мероприятий и
                  множество эксклюзивных композиций, которые нашли свой дом.
                </p>
                <p>
                  Наша цель — подарить атмосферу творчества, уюта и живого общения.
                </p>
              </div>
            </div>

            {/* Фото — уменьшаем высоту блока, чтобы карточка стала ниже */}
            <div className="h-full min-h-[360px]">
  <img
    src="/about/terrarium.jpg"
    alt="Флорариум"
    onError={(e) => { e.currentTarget.src = "/about/terrarium.png"; }}
    className="block w-full h-full object-cover"
  />
</div>
          </div>
        </div>
      </div>
    </section>
  );
}
