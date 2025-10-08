import "./globals.css";

export const metadata = {
  title: "DANDELION — сайт на коде",
  description: "Переводим дизайн из Framer в код",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-white text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  );
}
