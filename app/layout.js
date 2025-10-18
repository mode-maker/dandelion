// app/layout.js
import "./globals.css";
import BackgroundSeeds from "../components/BackgroundSeeds";

export const metadata = {
  title: "Dandelion",
  description: "Цветочная мастерская — флорариумы и мастер-классы",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="antialiased">
        {/* базовый фон */}
        <div className="site-bg" />

        {/* минималистичные семена */}
        <BackgroundSeeds />

        {children}
      </body>
    </html>
  );
}
