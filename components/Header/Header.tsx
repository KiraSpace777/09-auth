// components/Header/Header.tsx
// =============================
// Базова навігаційна панель користувача

import css from "./Header.module.css";
import Link from "next/link";
import AuthNavigation from "../AuthNavigation/AuthNavigation";

// КОНСТАНТА ДЛЯ МАРШРУТУ ПЕРЕХОДУ НА СТОРІНКУ З ФІЛЬТРАЦІЄЮ ВСІХ НОТАТОК
const ALL_NOTES_FILTER_ROUTE = "/notes/filter/all";

// КОМПОНЕНТ ГОЛОВНОГО ХЕДЕРА ДОДАТКА З НАВІГАЦІЙНИМИ ПОСИЛАННЯМИ
const Header = () => {
  return (
    <header className={css.header}>
      {/* КОРЕНЕВЕ ПОСИЛАННЯ НА ГОЛОВНУ СТОРІНКУ ДОДАТКА */}
      <Link href="/" className={css.headerLink} aria-label="Home">
        NoteHub
      </Link>

      <nav aria-label="Main Navigation">
        <ul className={css.navigation}>
          <li className={css.navigationItem}>
            <Link className={css.navigationLink} href="/">
              Home
            </Link>
          </li>

          <li className={css.navigationItem}>
            {/* ОНОВЛЕНО: ВИКОРИСТАННЯ ПРЯМОГО ШЛЯХУ ДО СТОРІНКИ ФІЛЬТРАЦІЇ */}
            <Link className={css.navigationLink} href={ALL_NOTES_FILTER_ROUTE}>
              Notes
            </Link>
          </li>

          {/* РЕНДЕРИМО ЕЛЕМЕНТИ АВТОРИЗАЦІЇ БЕЗПОСЕРЕДНЬО ВСЕРЕДИНІ СПИСКУ UL */}
          <AuthNavigation />
        </ul>
      </nav>
    </header>
  );
};

export default Header;
