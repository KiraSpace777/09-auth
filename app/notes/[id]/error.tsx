// ==========================================================
// Локальна перевірка помилок завантаження: app/notes/[id]
// ==========================================================
// app/notes/[id]/error.tsx
//
// Перевикористовуємо готовий компонент, щоб не дублювати CSS та розмітку
// error.tsx обов'язково має бути клієнтським ("use client"). Файли помилок у Next.js працюють як React Error Boundaries. Вони мають вміти перехоплювати помилки як на сервері, так і на клієнті, а також містять клієнтську функцію reset() для спроби повторного завантаження сторінки без повного перезавантаження браузера.
// ------------------------------------------------
"use client";

import css from "@/app/notes/filter/[...slug]/error.module.css";
import NotFound from "@/app/not-found";

const ERROR_TEXT = "Could not fetch note details.";

type Props = {
  error: {
    message?: string;
    digest?: string;
  };
};

export default function NotesError({ error }: Props) {
  // 📌 Безпечно перевіряємо ВСІ можливі варіанти 404 помилки (і від Next.js, і від сервера GoIT)
  const isNotFound =
    error?.message?.includes("NEXT_NOT_FOUND") ||
    error?.digest?.includes("NEXT_NOT_FOUND") ||
    error?.message?.includes("404") ||
    error?.message?.includes("not found");

  // Якщо це будь-який прояв 404 — чітко виводимо ваш NotFound компонент
  if (isNotFound) {
    return <NotFound />;
  }

  return (
    <p className={css.text}>
      {ERROR_TEXT} <br /> <br />
      {error?.message}
    </p>
  );
}

// =======================================
// "use client";

// import css from "@/app/notes/filter/[...slug]/error.module.css";

// type Props = {
//   error: Error;
// };

// export default function NotesError({ error }: Props) {
//   return <p className={css.text}>Could not fetch note details. {error.message}</p>;
// }
