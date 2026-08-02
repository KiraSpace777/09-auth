// ==========================================================
// Header - Базова навігаційна панель користувача
// ==========================================================
// components/Header/Header.tsx

import css from "./Header.module.css";
import Link from "next/link";

const Header = () => {
  return (
    <header className={css.header}>
      <Link className={css.headerLink} href="/" aria-label="Home" >
        NoteHub
      </Link>
      <nav aria-label="Main Navigation">
        <ul className={css.navigation}>
          <li className={css.navigationItem}>
            <Link className={css.navigationLink} href="/">Home</Link>
          </li>
          <li>
            {/* Додано в ДЗ 7: Паралельні маршрути для фільтрації нотаток за тегом*/}
            {/* Замінюємо застарілий шлях /notes на новий універсальний маршрут фільтрації "/notes/filter/all" */}
            <Link className={css.navigationLink} href="/notes/filter/all">Notes</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
