// app/(auth routes)/layout.tsx
// =============================
// Спільний шаблон (лейаут) для сторінок авторизації та реєстрації

import type { ReactNode } from "react";

// КОНСТАНТИ ДЛЯ СТИЛІЗАЦІЇ КОНТЕЙНЕРА АВТЕНТИФІКАЦІЇ НА ПОРТФОЛІО БЕЗ REM
const AUTH_LAYOUT_STYLES = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100%",
  width: "100%",
  backgroundColor: "transparent",
};

// ТИПІЗАЦІЯ ДЛЯ ВХІДНИХ ПАРАМЕТРІВ ШАБЛОНУ АВТЕНТИФІКАЦІЇ
interface AuthLayoutProps {
  children: ReactNode;
}

// ГОЛОВНИЙ КОМПОНЕНТ ЛЕЙАУТУ ГРУПИ МАРШРУТІВ (AUTH ROUTES)
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div style={AUTH_LAYOUT_STYLES}>
      {/* РЕНДЕРИНГ СТОРІНОК SIGN-IN ТА SIGN-UP ВСЕРЕДИНІ ОДНОРІДНОЇ ОБГОРТКИ */}
      {children}
    </div>
  );
}
