import { FaTelegramPlane, FaInstagram } from "react-icons/fa";

export default function Header() {
  return (
    <header className="w-full bg-[#3C3C3B]">
      {/* Контейнер шапки */}
      <div className="max-w-[1200px] mx-auto px-6 h-[64px] relative flex items-center">
        {/* ЦЕНТР: меню — абсолютно по центру вне зависимости от правого блока */}
        <nav className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center gap-16 text-[14px] tracking-[0.06em] uppercase text-[#ECECEC]">
          <a className="hover:opacity-80 transition" href="#">Мастер - классы</a>
          <a className="hover:opacity-80 transition" href="#">Флорариумы</a>
          <a className="hover:opacity-80 transition" href="#">Сертификат</a>
          <a className="hover:opacity-80 transition" href="#">Видео</a>
        </nav>

        {/* ПРАВО: телефон + соцсети */}
        <div className="ml-auto flex items-center gap-4 text-[14px] text-[#ECECEC]">
          <a className="hover:opacity-80 transition" href="tel:+79992343527">
            +7 (999) 234-35-27
          </a>
          <a
            className="hover:opacity-80 transition"
            href="https://t.me/yourtelegram"
            target="_blank"
            rel="noreferrer"
            aria-label="Telegram"
            title="Telegram"
          >
            <FaTelegramPlane size={18} />
          </a>
          <a
            className="hover:opacity-80 transition"
            href="https://instagram.com/yourinstagram"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            title="Instagram"
          >
            <FaInstagram size={18} />
          </a>
        </div>
      </div>
    </header>
  );
}
