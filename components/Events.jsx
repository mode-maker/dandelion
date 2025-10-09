"use client";

import { useEffect, useState } from "react";
import { Manrope, Caveat } from "next/font/google";

const manrope = Manrope({ subsets: ["cyrillic","latin"], weight: ["500","600","700"], display: "swap" });
const caveat  = Caveat({ subsets: ["cyrillic","latin"], weight: ["700"], display: "swap" });

// ❗Ты можешь смешивать локальные mp4 (из /public/events) и ссылки YouTube/Vimeo.
const ITEMS = [
  {
    title: "Корпоративный мастер-класс",
    date: "12.09.2025",
    duration: "01:12",
    thumb: "/events/corp-01.jpg",
    // пример локального файла: положи /public/events/corp-01.mp4
    video: "/events/corp-01.mp4",
    desc: "Тёплая атмосфера, индивидуальные композиции и много живого общения.",
  },
  {
    title: "Детский праздник во дворе",
    date: "28.08.2025",
    duration: "00:54",
    thumb: "/events/kids-yard.jpg",
    // пример YouTube: вставь полный URL
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    desc: "Простой и безопасный формат: дети собирают мини-сады и учатся ухаживать за растениями.",
  },
  {
    title: "Осенние композиции",
    date: "05.10.2025",
    duration: "01:26",
    thumb: "/events/autumn.jpg",
    video: "/events/autumn.mp4",
    desc: "Сезонные материалы, тёплые оттенки и уют — идеальные флорариумы для дома.",
  },
];

export default function Events() {
  const [open, setOpen] = useState(null); // { item }

  // закрытие по ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section className="py-16">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Заголовок секции */}
        <h2 className={`${caveat.className} text-[#ECEDE8] text-[32px] md:text-[36px] tracking-wide text-center mb-8`}>
          МЕРОПРИЯТИЯ
        </h2>

        {/* Подложка */}
        <div className="rounded-2xl bg-[#E7E8E0] p-6 shadow-[0_10px_28px_rgba(0,0,0,0.25)]">
          {/* На мобилке — горизонтальная лента (snap), на десктопе — сетка */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {/* ЛЕНТА для <md */}
            <div className="md:hidden -mx-4 px-4">
              <div className="no-scrollbar overflow-x-auto scroll-smooth snap-x snap-mandatory">
                <div className="flex gap-5 pr-3">
                  {ITEMS.map((it, idx) => (
                    <Card key={idx} item={it} onOpen={() => setOpen(it)} className="snap-start w-[82vw] max-w-[360px]" />
                  ))}
                </div>
              </div>
            </div>

            {/* СЕТКА для ≥md */}
            <div className="hidden md:contents">
              {ITEMS.map((it, idx) => (
                <Card key={idx} item={it} onOpen={() => setOpen(it)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Модалка-кинозал */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4" onClick={() => setOpen(null)}>
          <div className="relative w-full max-w-[960px] rounded-2xl overflow-hidden bg-[#EFE9DD] shadow-[8px_8px_24px_rgba(0,0,0,0.35)]" onClick={(e)=>e.stopPropagation()}>
            {/* video area 16:9 */}
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              {isEmbed(open.video) ? (
                <iframe
                  src={open.video}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video className="absolute inset-0 w-full h-full object-cover" src={open.video} controls autoPlay playsInline />
              )}
            </div>

            {/* подпись */}
            <div className="p-6">
              <div className={`${manrope.className} text-[24px] font-semibold text-[#1d1d1d]`}>{open.title}</div>
              <p className="mt-2 text-[16px] leading-7 text-[#333]">{open.desc}</p>

              <button
                className="mt-6 inline-flex items-center rounded-md bg-[#3F3F3F] text-[#E7E8E0] px-4 py-2 text-[14px]
                           transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                onClick={() => setOpen(null)}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Card({ item, onOpen, className = "" }) {
  return (
    <article className={`rounded-xl bg-white/70 backdrop-blur p-3 shadow-[0_6px_18px_rgba(0,0,0,0.20)] ${className}`}>
      {/* превью с кнопкой play */}
      <button onClick={onOpen} className="group relative block w-full rounded-lg overflow-hidden">
        <img
          src={item.thumb}
          alt={item.title}
          className="block w-full h-[200px] md:h-[180px] object-cover"
          onError={(e)=>{ e.currentTarget.src="/about/terrarium.jpg"; }}
        />
        {/* тёмный градиент снизу для читаемости */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
        {/* Play */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-white/85 text-[#3F3F3F] px-4 py-3 transition transform
                          group-hover:-translate-y-0.5 group-hover:shadow-md">
            ▶
          </div>
        </div>
        {/* дата + длительность */}
        <div className="absolute left-3 bottom-3 flex items-center gap-2 text-[12px] text-white/95">
          <span className="bg-black/45 rounded px-2 py-0.5">{item.date}</span>
          <span className="bg-black/45 rounded px-2 py-0.5">{item.duration}</span>
        </div>
      </button>

      {/* подписи под превью */}
      <div className="mt-3">
        <div className={`${manrope.className} text-[20px] font-semibold text-[#1d1d1d]`}>{item.title}</div>
        <p className="mt-1 text-[14px] leading-6 text-[#3b3b3b] line-clamp-2">
          {item.desc}
        </p>
      </div>

      {/* кнопки */}
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={onOpen}
          className="rounded-md bg-[#E7E8E0] text-[#222] px-4 py-1.5 text-[14px]
                     transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
        >
          Смотреть видео
        </button>
        <a
          href="https://t.me/yourtelegram" target="_blank" rel="noreferrer"
          className="rounded-md bg-[#3F3F3F] text-[#E7E8E0] px-4 py-1.5 text-[14px]
                     transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
        >
          Записаться
        </a>
      </div>
    </article>
  );
}

function isEmbed(url) {
  return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/i.test(url);
}
