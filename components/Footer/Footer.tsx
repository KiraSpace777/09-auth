// ==========================================================
// Footer
// ==========================================================
// components/Footer/Footer.tsx

import css from "./Footer.module.css";
import Link from "next/link";

// ІНФОРМАЦІЙНІ КОНСТАНТИ
const NOTE_API_INFO_URL = "https://notehub-public.goit.study/api/docs/#/";
const DEVELOPER_NAME = "Anna Krochak";
const CONTACT_EMAIL = "student@notehub.app";

const Footer = () => {
  return (
    <footer className={css.footer}>
      <div className={css.content}>
        {/* // === [ДЗ 7: Паралельні маршрути для фільтрації нотаток за тегом] === */}
        {/* Додаємо suppressHydrationWarning, щоб усунути помилку невідповідності дат між сервером та клієнтом */}
        <p suppressHydrationWarning>
          © {new Date().getFullYear()}{" "}
          <Link href={NOTE_API_INFO_URL} target="_blank" rel="noopener noreferrer">
            NoteHub
          </Link>
          . All rights reserved.
        </p>
        <div className={css.wrap}>
          <p>Developer: {DEVELOPER_NAME}</p>
          <p>
            Contact us:{" "}
            <Link href={`mailto:${CONTACT_EMAIL}`} target="_blank">
              {CONTACT_EMAIL}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
