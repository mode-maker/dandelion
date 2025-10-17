"use client";

import Link from "next/link";
import { FaTelegramPlane, FaInstagram } from "react-icons/fa";

export default function Header() {
  return (
    <header className="w-full">
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
        {/* ЛЕВО: меню */}
        <nav className="flex items-center gap-6 text-[#ECEDE8]">
          <Link href="#workshops" className="hover:opacity-90">Мастер-классы</Link>
          <Link href="#terrariums" className="hover:opacity-90">Флорариумы</Link>
          <Link href="#certificate" className="hover:opacity-90">Сертификат</Link>
          <Link href="#video" className="hover:opacity-90">Видео</Link>
        </nav>

        {/* ПРАВО: телефон + иконки */}
        <div className="flex items-center gap-5">
          <a href="tel:+79992343527" className="text-[#ECEDE8] hover:opacity-90">
            +7 (999) 234-35-27
          </a>
          <div className="flex items-center gap-3 text-[#ECEDE8]">
            <a href="https://t.me/dandelion" target="_blank" rel="noreferrer" aria-label="Telegram" className="hover:opacity-90">
              <FaTelegramPlane size={20} />
            </a>
            <a href="https://instagram.com/dandelion" target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:opacity-90">
              <FaInstagram size={20} />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
