// app/(private routes)/layout.tsx
// ===============================
// Головний приватний лейаут для підключення паралельних маршрутів модальних вікон

import React from "react";

// ТИПІЗАЦІЯ ПРИВАТНОГО ЛЕЙAУТУ СТОРІНКИ
interface PrivateLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

// СЕРВЕРНИЙ КОМПОНЕНТ ДЛЯ ОДНОЧАСНОГО ВИВЕДЕННЯ СТОРІНОК ТА ПРЕВ'Ю НОТАТОК
export default function PrivateLayout({ children, modal }: PrivateLayoutProps) {
  return (
    <>
      {/* РЕНДЕР ОСНОВНОГО КЛІЄНТСЬКОГО КОНТЕНТУ ПРОГРАМИ */}
      {children}

      {/* ВІДОБРАЖЕННЯ ПЕРЕХОПЛЕНИХ МОДАЛЬНИХ МАРШРУТІВ ПРЕВ'Ю */}
      {modal}
    </>
  );
}
