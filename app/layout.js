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
  count={32}
  minR={65}
  maxR={120}
  minSpeed={4}
  maxSpeed={10}
  baseOpacity={0.10}
  stemsMin={18}
  stemsMax={34}
  minVisible={18}
  viewportSpawnRatio={0.8}
/>


        {children}
      </body>
    </html>
  );
}
