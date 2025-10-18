// app/layout.js
import "./globals.css";
import dynamic from "next/dynamic";

// ВАЖНО: динамический импорт клиентского бэкграунда без SSR
const Dandelions = dynamic(
  () => import("../components/BackgroundDandelionField"),
  { ssr: false }
);

export const metadata = {
  title: "Dandelion",
  description: "Цветочная мастерская — флорариумы и мастер-классы",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="antialiased">
        {/* Фоновая подложка из globals.css */}
        <div className="site-bg" />

        {/* Анимированные одуванчики (если компонент существует по пути выше) */}
        <Dandelions
          count={22}       // количество "семян"
          minVisible={10}  // минимум видимых на экране
          scale={1}        // масштаб 1 = как сейчас (можно 0.8–1.2)
          baseSpeed={16}   // базовая скорость (меньше — медленнее)
        />

        {children}
      </body>
    </html>
  );
}
