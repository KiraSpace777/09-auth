// ==========================================================
// Локальна перевірка помилок завантаження: app/notes
// ==========================================================
// error.tsx обов'язково має бути клієнтським ("use client"). Файли помилок у Next.js працюють як React Error Boundaries. Вони мають вміти перехоплювати помилки як на сервері, так і на клієнті, а також містять клієнтську функцію reset() для спроби повторного завантаження сторінки без повного перезавантаження браузера.
// ------------------------------------------------
// app/(private routes)/notes/filter/[...slug]/error.tsx

"use client";

import { useEffect } from "react";
import css from "./error.module.css";
import NotFound from "@/app/not-found";

const ERROR_TEXT = "Could not fetch the list of notes.";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function NotesError({ error, reset }: Props) {
  // Логуємо помилку для дебагу, як рекомендує документація Next.js
  useEffect(() => {
    console.error("Caught an error at [...slug] level:", error);
  }, [error]);

  // Перевіряємо, чи помилка викликана функцією notFound() на сервері
  const isNotFoundError =
    error.message?.includes("NEXT_NOT_FOUND") || error.digest?.includes("NEXT_NOT_FOUND");

  // Рендеримо компонент <NotFound />, повністю прибравши викликач функції notFound(),
  // що ліквідує помилку "Unreachable code" та успішно використовує імпортований компонент!
  if (isNotFoundError) {
    return <NotFound />;
  }

  return (
    <div className={css.errorContainer}>
      {/* Показуємо локальний перевизначений текст помилки для цього рівня */}
      <h2 className={css.title}>{ERROR_TEXT}</h2>
      <p className={css.message}>
        {error.message || "An unexpected error occurred while loading your filtered notes."}
      </p>

      {/* Кнопка скидання (reset) дозволяє спробувати перерендерити сегмент без перезавантаження всієї сторінки */}
      <button type="button" className={css.resetButton} onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}

// ===============================================
// "use client";

// import { useEffect } from "react";
// import NotFound from "@/app/not-found";
// import css from "./error.module.css";

// const ERROR_TEXT = "Could not fetch the list of notes.";

// type Props = {
//   error: Error & { digest?: string };
// };

// export default function NotesError({ error }: Props) {
//   // Перевіряємо, чи помилка викликана функцією notFound()
//   const isNotFound =
//     error.message?.includes("NEXT_NOT_FOUND") || error.digest?.includes("NEXT_NOT_FOUND");

//   if (isNotFound) {
//     return <NotFound />;
//   }

//   return (
//     <p className={css.text}>
//       {ERROR_TEXT} <br /> <br />
//       {error.message}
//     </p>
//   );
// }

// ===================================
// "use client";

// import css from "./error.module.css";

// type Props = {
//   error: Error;
// };

// export default function NotesError({ error }: Props) {
//   return <p className={css.text}>Could not fetch the list of notes. {error.message}</p>;
// }
