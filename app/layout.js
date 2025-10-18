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
        {/* фоновые слои (оба под контентом) */}
        <div className="site-bg" />
        <div className="bg-blobs" />

        {children}
      </body>
    </html>
  );
}
