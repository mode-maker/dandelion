"use client";

import Image from "next/image";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "600"],
  display: "swap",
});

// Иконки (SVG inline)
function PinIcon(props) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 21s7-5.14 7-11a7 7 0 1 0-14 0c0 5.86 7 11 7 11z" stroke="#ECEDE8" strokeWidth="1.6" />
      <circle cx="12" cy="10" r="2.7" fill="#ECEDE8" />
    </svg>
  );
}
function PhoneIcon(props) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M5 4h3l2 5-2 1a11 11 0 0 0 6 6l1-2 5 2v3c0 1.1-.9 2-2 2A16 16 0 0 1 3 6c0-1.1.9-2 2-2z" stroke="#ECEDE8" strokeWidth="1.6" />
    </svg>
  );
}
function InstagramIcon(props) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="#ECEDE8" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.8" stroke="#ECEDE8" strokeWidth="1.6" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="#ECEDE8" />
    </svg>
  );
}
// ← СТАРЫЙ ВАРИАНТ TELEGRAM (контур)
function TelegramIcon(props) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M21 3 3 11l6 2 2 6 4-5 4-11z" stroke="#ECEDE8" strokeWidth="1.6" />
    </svg>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16">
      {/* Узкая верхняя полоска */}
      <div className="h-1 bg-[#6F8076]/70" />

      <div className="bg-[#3F3F3F] text-[#ECEDE8]">
        <div className="max-w-[1200px] mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-10 items-center">
          {/* ЛЕВО: контакты */}
          <div className={`${manrope.className} text-[15px] leading-7`}>
            <div className="flex items-start gap-3.5">
              <PinIcon className="mt-[2px]" />
              <span>г. Москва</span>
            </div>
            <div className="mt-1 flex items-start gap-3.5">
              <PhoneIcon className="mt-[2px]" />
              <a href="tel:+79992343527" className="hover:underline">
                +7 (999) 234-35-27
              </a>
            </div>
            <div className="mt-2 flex items-center gap-3.5">
              <InstagramIcon />
              <a
                href="https://instagram.com/dandelion"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                @dandelion
              </a>
            </div>
            {/* Telegram — СТАРАЯ ИКОНКА */}
            <div className="mt-1 flex items-center gap-3.5">
              <TelegramIcon />
              <a
                href="https://t.me/dandelion"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                @dandelion
              </a>
            </div>
          </div>

          {/* ЦЕНТР: логотип — используем тот же файл, что в Hero */}
          <div className="flex justify-center items-center">
            <Image
              src="/hero/logo.png"
              alt="Dandelion"
              width={200}
              height={70}
              className="opacity-95"
              priority={false}
            />
          </div>

          {/* ПРАВО: юр-текст по правому краю */}
          <div className={`${manrope.className} text-[14px] leading-6 justify-self-end`}>
            <div className="max-w-[380px] text-right">
              <p>
                Все права защищены. Все товарные знаки и другие средства
                индивидуализации, представленные на данном сайте, принадлежат
                их законным владельцам.
              </p>
              <p className="mt-1">© {year} Dandelion</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
