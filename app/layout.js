import "./globals.css";
import { Montserrat } from "next/font/google";

const mont = Montserrat({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "DANDELION — сайт на коде",
  description: "Переводим дизайн из Framer в код",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      {/* Без bg-white — чтобы был виден глобальный градиент из globals.css */}
      <body className={`${mont.className} min-h-screen text-zinc-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
