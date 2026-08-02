// =======================================================
//  app/notes/filter/@sidebar/default.tsx
// =======================================================
// Створення Sidebar для фільтрації нотаток по тегам та запобіганню
// Build Error в Next.js. У цьому компоненті потрібно створити меню з
// посиланнями для фільтрації нотаток за різними тегами. Кожне посилання
// має вести на маршрут, де відображаються лише нотатки, що відповідають обраному тегу.
// =======================================================

import Link from "next/link";
import css from "./SidebarNotes.module.css";

// === [ГЛОБАЛЬНІ КОНСТАНТИ] ===
// На бекенді немає маршруту для отримання списку тегів, тому для роботи використайте цей перелік безпосередньо в коді.
// ------------------------------------------------------------------
const TAGS = ["Todo", "Work", "Personal", "Meeting", "Shopping"];

export default function DefaultSidebarNotes() {
  // У дефолтному стані жоден динамічний тег не вибрано, тому активним є "All notes"
  return (
    <div className={css.menuList}>
      <ul className={css.menuList}>
        <li className={css.menuItem}>
          <Link href="/notes/filter/all" className={`${css.menuLink} ${css.active}`}>
            All notes
          </Link>
        </li>

        {TAGS.map((tag) => (
          <li key={tag} className={css.menuItem}>
            <Link href={`/notes/filter/${tag}`} className={css.menuLink}>
              {tag}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
