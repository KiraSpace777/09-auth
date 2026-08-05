// app/(private routes)/notes/filter/layout.tsx
// ==========================================================
// FilterLayout - паралельний лейаут для сторінки фільтрації
// в ньому потрібно отримати sidebar в пропсах
// ==========================================================
// Паралельний лейаут для сторінки фільтрації нотаток

import React, { Suspense } from "react";
import css from "./LayoutNotes.module.css";
import Loading from "@/app/loading";

// ТИПІЗАЦІЯ ПРОПСІВ ДЛЯ ЛЕЙAУТУ СТОРІНКИ ФІЛЬТРІВ
interface FilterLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

// СЕРВЕРНИЙ КОМПОНЕНТ ЛЕЙAУТУ СТОРІНКИ ФІЛЬТРАЦІЇ НОТАТОК
export default function FilterLayout({ children, sidebar }: FilterLayoutProps) {
  return (
    <section className={css.container}>
      {/* БІЧНА ПАНЕЛЬ ДЛЯ ВІДОБРАЖЕННЯ ДОСТУПНИХ ТЕГІВ ТA ФІЛЬТРІВ */}
      <aside className={css.sidebar}>{sidebar}</aside>

      {/* ОСНОВНИЙ КОНТЕНТ ЗІ СПИСКОМ ВІДФІЛЬТРОВАНИХ НОТАТОК КОРИСТУВАЧА */}
      <div className={css.notesWrapper}>
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </div>
    </section>
  );
}
