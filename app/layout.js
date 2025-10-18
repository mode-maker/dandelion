// app/layout.js
import "./globals.css";
import BackgroundDandelions from "../components/BackgroundDandelions";

export const metadata = {
  title: "Dandelion",
  description: "Цветочная мастерская — флорариумы и мастер-классы",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="antialiased">
        {/* базовый градиентный фон */}
        <div className="site-bg" />
        {/* новый слой с одуванчиками */}
        <BackgroundDandelions />

        {children}
      </body>
    </html>
  );
}
