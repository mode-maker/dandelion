// app/layout.js
import "./globals.css";
import BackgroundSeedsAnimated from "../components/BackgroundSeedsAnimated"; // <— ВАЖНО: Animated

export const metadata = {
  title: "Dandelion",
  description: "Цветочная мастерская — флорариумы и мастер-классы",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="antialiased">
        <div className="site-bg" />

        {/* семена (маленькие, плавающие) */}
        <BackgroundSeedsAnimated count={12} minSize={14} maxSize={22} opacity={0.10} />

        {children}
      </body>
    </html>
  );
}
