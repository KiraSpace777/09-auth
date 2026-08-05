// app/notes/filter/@sidebar/[...slug]/page.tsx
// =======================================================
// Динамічний сайдбар із підсвічуванням активного тегу
// Паралельні маршрути для фільтрації нотаток за тегом
// =======================================================

import Link from "next/link";
import css from "../SidebarNotes.module.css";
// import css from "@/app/(private routes)/notes/filter/@sidebar/SidebarNotes.module.css";

// === [ГЛОБАЛЬНІ КОНСТАНТИ] ===
const TAGS = ["Todo", "Work", "Personal", "Meeting", "Shopping"];
const DEFAULT_TAG = "all";

interface SidebarProps {
  // Приймаємо асинхронні параметри динамічного catch-all роуту [...slug] для сайдбару
  params: Promise<{ slug: string[] }>;
}

export default async function SidebarNotes({ params }: SidebarProps) {
  // Проводимо асинхронне розгортання параметрів шляху
  const resolvedParams = await params;

  // Визначаємо поточний активний тег з URL (перший елемент масиву slug). Якщо порожньо — 'all'.
  const currentActiveTag = resolvedParams.slug?.[0] || DEFAULT_TAG;

  return (
    <ul className={css.menuList}>
      {/* Статичне посилання через Link */}
      <li className={css.menuItem}>
        {/* Динамічно додаємо клас активного стану css.active, якщо поточний тег в URL є 'all' */}
        <Link
          href="/notes/filter/all"
          className={`${css.menuLink} ${currentActiveTag === "all" ? css.active : ""}`}
        >
          All notes
        </Link>
      </li>

      {/* Динамічні посилання через Link */}
      {TAGS.map((tag) => (
        <li key={tag} className={css.menuItem}>
          {/* Порівнюємо поточний тег з URL із тегом у масиві. Якщо вони збігаються, додаємо клас css.active для візуального підсвічування активного стану */}
          <Link
            href={`/notes/filter/${tag}`}
            className={`${css.menuLink} ${currentActiveTag === tag ? css.active : ""}`}
          >
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}
