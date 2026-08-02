// ============================================================================
// Глобальна розмітка структури сторінок (повторювані елементи)
// ============================================================================
// Підключення провайдера React Query (для завантаження даних у
// клієнтському компоненті), робимо один раз на весь проєкт, тому
// робимо це в головному шаблоні "app/layout.tsx", імпорт із папки:
//
// components/TanStackProvider/TanStackProvider.tsx
// ============================================================================

import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import TanStackProvider from "@/components/TanStackProvider/TanStackProvider";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import "./globals.css";

// Налаштування оптимізованого шрифту Roboto за допомогою Next.js Font
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto",
});

// Статичні метадані для головного layout (головна сторінка застосунку)
export const metadata: Metadata = {
  title: "NoteHub — Додаток для керування нотатками",
  description:
    "Зручний та продуктивний застосунок для створення, редагування та фільтрації ваших щоденних нотаток.",
  openGraph: {
    title: "NoteHub — Додаток для керування нотатками",
    description:
      "Зручний та продуктивний застосунок для створення, редагування та фільтрації ваших щоденних нотаток.",
    url: "https://notehub.com/",
    images: [
      {
        url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
        width: 1200,
        height: 630,
        alt: "Прев'ю головної сторінки додатку NoteHub",
      },
    ],
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode; // Паралельний слот для модального вікна
}

export default function RootLayout({ children, modal }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${roboto.className}`}>
        <TanStackProvider>
          <Header />
          <main>{children}</main>

          {/* Рендеримо модальне вікно на найвищому рівні додатка */}
          {modal}

          <Footer />
        </TanStackProvider>
      </body>
    </html>
  );
}
