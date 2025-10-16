"use client";

import { Manrope } from "next/font/google";
const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "600"],
  display: "swap",
});

// простые inline-иконки (без внешних зависимостей)
function PinIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 21s7-5.14 7-11a7 7 0 1 0-14 0c0 5.86 7 11 7 11z" stroke="#ECEDE8" strokeWidth="1.5" />
      <circle cx="12" cy="10" r="2.5" fill="#ECEDE8" />
    </svg>
  );
}
function PhoneIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M5 4h3l2 5-2 1a11 11 0 0 0 6 6l1-2 5 2v3c0 1.1-.9 2-2 2A16 16 0 0 1 3 6c0-1.1.9-2 2-2z" stroke="#ECEDE8" strokeWidth="1.5" />
    </svg>
  );
}
function InstagramIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="#ECEDE8" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3.5" stroke="#ECEDE8" strokeWidth="1.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="#ECEDE8" />
    </svg>
  );
}
function TelegramIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M21 3 3 11l6 2 2 6 4-5 4-11z" stroke="#ECEDE8" strokeWidth="1.5" />
    </svg>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16">
      {/* тонкая полоска в фирменном оттенке сверху футера */}
      <div className="h-2 bg-[#6F8076]/70" />
      <div className="bg-[#3F3F3F] text-[#ECEDE8]">
        <div className="max-w-[1200px] mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-center">
          {/* ЛЕВАЯ КОЛОНКА: контакты */}
          <div className={`${manrope.className} text-[15px] leading-7`}>
            <div className="flex items-start gap-3">
              <PinIcon className="mt-[2px]" />
              <span>г. Москва</span>
            </div>
            <div className="mt-1 flex items-start gap-3">
              <PhoneIcon className="mt-[2px]" />
              <a href="tel:+79992343527" className="hover:underline">
                +7 (999) 234-35-27
              </a>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <InstagramIcon />
              <a
                href="https://instagram.com/dandelion"
                target="_blank"
                className="hover:underline"
                rel="noreferrer"
              >
                @dandelion
              </a>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <TelegramIcon />
              <a
                href="https://t.me/dandelion"
                target="_blank"
                className="hover:underline"
                rel="noreferrer"
              >
                @dandelion
              </a>
            </div>
          </div>

          {/* ЦЕНТР: логотип */}
          <div className="flex justify-center">
            {/* если у тебя есть файл логотипа — положи его в /public/logo/dandelion-script.svg */}
            <img
              src="/logo/dandelion-script.svg"
              alt="Dandelion"
              className="h-[50px] w-auto opacity-95"
              onError={(e) => {
                // красивый текстовый запасной вариант, если файла пока нет
                e.currentTarget.outerHTML =
                  '<div style="font-family:serif;font-style:italic;font-size:28px;opacity:.95">Dandelion</div>';
              }}
            />
          </div>

          {/* ПРАВАЯ КОЛОНКА: юридический текст */}
          <div className={`${manrope.className} text-[13px] md:text-[14px] text-right leading-6`}>
            <p>
              Все права защищены. Все товарные знаки и другие средства индивидуализации,
              представленные на данном сайте, принадлежат их законным владельцам.
            </p>
            <p className="mt-1 opacity-90">© {year} Dandelion</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
