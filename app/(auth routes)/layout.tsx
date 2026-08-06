// app/(auth routes)/layout.tsx
// =============================
// Спільний шаблон (лейаут) для сторінок авторизації та реєстрації

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

const AUTH_LAYOUT_STYLES = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100%",
  width: "100%",
  backgroundColor: "transparent",
};

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();

  // ОНОВЛЕННЯ ДАНИХ РОУТЕРА ПРИ МОНТУВАННІ КОМПОНЕНТА ДЛЯ СИНХРОНІЗАЦІЇ СТАНУ АВТОРІЗАЦІЇ
  useEffect(() => {
    router.refresh();
  }, [router]);

  return <div style={AUTH_LAYOUT_STYLES}>{children}</div>;
}
