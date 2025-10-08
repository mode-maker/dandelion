import { FaTelegramPlane, FaInstagram } from "react-icons/fa";

export default function Header() {
  return (
    <header className="bg-[#3D3D3D] text-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="h-16 flex items-center justify-between">
          {/* ЛЕВАЯ ЧАСТЬ: меню */}
          <nav className="flex items-center gap-12 tracking-wide">
            <a className="hover:opacity-80 transition" href="#">МАСТЕР - КЛАССЫ</a>
            <a className="hover:opacity-80 transition" href="#">ФЛОРАРИУМЫ</a>
            <a className="hover:opacity-80 transition" href="#">СЕРТИФИКАТ</a>
            <a className="hover:opacity-80 transition" href="#">ВИДЕО</a>
          </nav>

          {/* ПРАВАЯ ЧАСТЬ: телефон + соцсети */}
          <div className="flex items-center gap-4">
            <a className="hover:opacity-80 transition" href="tel:+79992343527">+7 (999) 234-35-27</a>
            <a className="hover:opacity-80 transition" href="https://t.me/yourtelegram" target="_blank" rel="noreferrer">
              <FaTelegramPlane size={18} />
            </a>
            <a className="hover:opacity-80 transition" href="https://instagram.com/yourinstagram" target="_blank" rel="noreferrer">
              <FaInstagram size={18} />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
