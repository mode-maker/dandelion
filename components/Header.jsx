import { FaTelegramPlane, FaInstagram } from "react-icons/fa";

export default function Header() {
  return (
    <header className="bg-[#3C3C3B] text-[#ECECEC]">
      {/* Внутренняя сетка: [левый пустой 1fr] [центр авто] [правый блок авто] */}
      <div className="max-w-7xl mx-auto px-10 h-16 grid grid-cols-[1fr_auto_auto] items-center">
        {/* Левый «пустой» столбец нужен, чтобы меню было ИМЕННО по центру */}
        <div aria-hidden />

        {/* ЦЕНТР: меню */}
        <nav className="flex items-center gap-14 text-[13px] tracking-wide uppercase">
          <a className="hover:opacity-80 transition" href="#">Мастер - классы</a>
          <a className="hover:opacity-80 transition" href="#">Флорариумы</a>
          <a className="hover:opacity-80 transition" href="#">Сертификат</a>
          <a className="hover:opacity-80 transition" href="#">Видео</a>
        </nav>

        {/* ПРАВО: телефон + соцсети */}
        <div className="flex items-center justify-end gap-4 text-sm">
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
