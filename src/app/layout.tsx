import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Сказки Онлайн — Бесплатные сказки для детей",
  description: "Читайте тысячи сказок для детей онлайн бесплатно. Сказки для детей 3-12 лет с иллюстрациями и аудио.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
