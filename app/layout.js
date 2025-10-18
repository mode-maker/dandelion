// app/layout.js
import "./globals.css";

export const metadata = {
  title: "Dandelion",
  description: "Цветочная мастерская — флорариумы и мастер-классы",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      {/* head оставляем пустым — Next сам подставит метаданные */}
      <body className="antialiased">
        {/* Фон-слой. Класс .site-bg описан в globals.css */}
        <div className="site-bg" />

        {children}
      </body>
    </html>
  );
}
// app/layout.js
import "./globals.css";

export const metadata = {
  title: "Dandelion",
  description: "Цветочная мастерская — флорариумы и мастер-классы",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="antialiased">
        {/* Фоны под контентом */}
        <div className="site-bg" />
        <div className="bg-seeds" />

        {children}
      </body>
    </html>
  );
}
