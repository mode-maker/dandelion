// app/layout.js
import "./globals.css";
import BackgroundDandelionField from "../components/BackgroundDandelionField";

export const metadata = {
  title: "Dandelion",
  description: "Цветочная мастерская — флорариумы и мастер-классы",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="antialiased">
        {/* базовый фон (градиент из globals.css) */}
        <div className="site-bg" />

        {/* анимированное поле одуванчиков на canvas */}
        <BackgroundDandelionField
          count={26}
          minR={13}
          maxR={24}
          minSpeed={0.06}
          maxSpeed={0.22}
          baseOpacity={0.10}
        />

        {children}
      </body>
    </html>
  );
}
