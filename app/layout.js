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
        {/* твой базовый градиент */}
        <div className="site-bg" />

        {/* одуванчиковое поле на canvas */}
        <BackgroundDandelionField
          count={26}           // можно 18–34
          minR={13}
          maxR={24}
          minSpeed={0.06}
          maxSpeed={0.22}
          baseOpacity={0.10}   // 0.08–0.16 под вкус
        />

        {children}
      </body>
    </html>
  );
}
