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
        {/* Фон-подложка из globals.css */}
        <div className="site-bg" />

        {/* Если используешь анимированные одуванчики, оставь их тут: */}
        {/* <BackgroundDandelionField count={26} /> */}

        {/* анимированное поле одуванчиков на canvas */}
       <BackgroundDandelionField
  count={22}     // больше/меньше объектов
  minR={15}
  maxR={30}     // размер шапочек (радиус в px)
  minSpeed={4}
  maxSpeed={10}  // скорость в px/сек
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
