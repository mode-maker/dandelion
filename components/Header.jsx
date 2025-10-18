"use client";

import { useCallback } from "react";
import Link from "next/link";
import { FaTelegramPlane, FaInstagram } from "react-icons/fa";
import { Manrope } from "next/font/google";

// добавили 400-й вес, как в footer
const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "600"], // 400 — основной тонкий, 600 — если понадобится выделить
  display: "swap",
});

export default function Header() {
  // плавная прокрутка к секциям
  const goTo = useCallback(
    (target) => (e) => {
      e.preventDefault();
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    []
  );

  return (
    <header className={`${manrope.className} w-full`}>
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
        {/* ЛЕВО: меню — тонкий шрифт */}
        <nav className="flex items-center gap-6 text-[#ECEDE8] text-[20px] font-normal">
          <Link href="#workshops" onClick={goTo("workshops")} className="hover:opacity-90">
            Мастер-классы
          </Link>
          <Link href="#ready" onClick={goTo("ready")} className="hover:opacity-90">
            Флорариумы
          </Link>
          <Link href="#certificate" onClick={goTo("certificate")} className="hover:opacity-90">
            Сертификат
          </Link>
          <Link href="#events" onClick={goTo("events")} className="hover:opacity-90">
            Видео
          </Link>
        </nav>

        {/* ПРАВО: телефон + иконки — тоже тонкий */}
        <div className="flex items-center gap-5 text-[18px] font-normal">
          <a href="tel:+79992343527" className="text-[#ECEDE8] hover:opacity-90">
            +7 (999) 234-35-27
          </a>
          <div className="flex items-center gap-3 text-[#ECEDE8]">
            <a
              href="https://t.me/dandelion"
              target="_blank"
              rel="noreferrer"
              aria-label="Telegram"
              className="hover:opacity-90"
              title="Telegram"
            >
              <FaTelegramPlane size={20} />
            </a>
            <a
              href="https://instagram.com/dandelion"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="hover:opacity-90"
              title="Instagram"
            >
              <FaInstagram size={20} />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
