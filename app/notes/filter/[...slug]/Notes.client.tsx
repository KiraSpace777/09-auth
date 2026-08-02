// ==========================================================
// NotesClient - робота з CSR рендерингом
// CSR (Client-Side Rendering): "use client"
// ==========================================================
// У клієнтському компоненті NotesClient потрібно отримати пропс tag та використати його в useQuery.
// Паралельні маршрути для фільтрації нотаток за тегом
// ----------------------------------------------------------
// app/notes/filter/[...slug]/notes.client.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api";

import NoteList from "@/components/NoteList/NoteList";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";
import Loading from "@/app/loading";

import css from "./NotesPage.module.css";

// ---------------------------------------------
// Глобальні константи налаштування сторінки
// ---------------------------------------------
const NOTES_PER_PAGE = 10;
const DEBOUNCE_DELAY = 500;

interface NotesClientProps {
  initialPage: number;
  initialSearch: string;
  tag: string;
}

export default function NotesClient({ initialPage, initialSearch, tag }: NotesClientProps) {
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Логіка дебаунсу пошукового запиту
  useEffect(() => {
    if (searchInput === initialSearch) return;

    const debouncerTimer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(debouncerTimer);
  }, [searchInput, initialSearch]);

  // Запит useQuery тепер підписаний на ЛОКАЛЬНІ реактивні стани (currentPage, debouncedSearch)
  const { data, isFetching } = useQuery({
    queryKey: ["notes", currentPage, debouncedSearch, tag],
    queryFn: () =>
      fetchNotes({
        page: currentPage,
        perPage: NOTES_PER_PAGE,
        search: debouncedSearch,
        tag: tag,
      }),
    placeholderData: (previousData) => previousData,
  });

  // Елегантно оновлюємо URL-адресу без примусового виклику серверного компонента Next.js
  // Це повністю ліквідує гонку запитів та усуває виліт у 404 помилку
  useEffect(() => {
    const queryParams = new URLSearchParams();
    queryParams.set("page", String(currentPage));
    if (debouncedSearch) {
      queryParams.set("search", debouncedSearch);
    }

    const newUrl = `/notes/filter/${tag}?${queryParams.toString()}`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl);
  }, [debouncedSearch, currentPage, tag]);

  // Колбек для оновлення текста в інпуті
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  // Колбек для зміни сторінки пагінації (приймає чисте число)
  const handlePageChange = useCallback(
    (page: number) => {
      if (isFetching) return; // Ігноруємо будь-які додаткові кліки, поки йде завантаження
      setCurrentPage(page);
    },
    [isFetching],
  );

  // Глобальне перехоплення стрілок на клавіатурі з повним блокуванням під час завантаження
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return;
      if (!data || data.totalPages <= 1) return;
      if (isFetching) return; // Повністю ігноруємо клавіатуру, якщо сторінка змінюється

      if (event.key === "ArrowLeft") {
        if (currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
      } else if (event.key === "ArrowRight") {
        if (currentPage < data.totalPages) {
          setCurrentPage((prev) => prev + 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, data, isFetching]);

  return (
    /* 
      ЗАБЕЗПЕЧЕНО UX: pointerEvents жорстко відключає взаємодію з екраном під час завантаження.
      opacity робить весь заблокований фон напівпрозорим, даючи користувачу візуальний відгук.
    */
    <div
      className={css.app}
      style={{
        pointerEvents: isFetching ? "none" : "auto",
        opacity: isFetching ? 0.5 : 1,
        transition: "opacity 0.2s ease",
      }}
    >
      <div className={css.toolbar}>
        {/* Початок рядка: Компонент пошуку нотаток (Контрольований) */}
        <SearchBox onSearchChange={handleSearchChange} value={searchInput} />

        {/* Середина рядка: Компонент пагінації (Контрольований) */}
        {data && data.totalPages > 1 && (
          <Pagination
            pageCount={data.totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}

        {/* Кінець рядка: Кнопка створення нотатки */}
        <button
          type="button"
          className={css.button}
          disabled={isFetching}
          // Тут залишаємо дефолтний перехід Next.js, оскільки це відкриття абсолютно іншої сторінки
          onClick={() => window.location.assign("/notes/action/create")}
        >
          create note +
        </button>
      </div>

      {/* 
        Коли йде завантаження сторінки, список нотаток повністю ховається, 
        і замість нього по центру рендериться ваш оригінальний компонент <Loading />
      */}
      {isFetching ? (
        <Loading />
      ) : (
        <>
          {data && data.notes.length === 0 && (
            <p className={css.emptyMessage}>
              No notes found for <strong>{debouncedSearch || "this criteria"}</strong>. Create a new
              one or try another search.
            </p>
          )}

          {/* Список карток нотаток відображається після завантаження */}
          {data && data.notes.length > 0 && <NoteList notes={data.notes} />}
        </>
      )}
    </div>
  );
}

// =====================================================
// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { useRouter } from "next/navigation";
// import { fetchNotes } from "@/lib/api";

// import NoteList from "@/components/NoteList/NoteList";
// import SearchBox from "@/components/SearchBox/SearchBox";
// import Pagination from "@/components/Pagination/Pagination";
// import css from "./NotesPage.module.css";

// // ---------------------------------------------
// // Глобальні константи налаштування сторінки
// // ---------------------------------------------
// const NOTES_PER_PAGE = 10;
// const DEBOUNCE_DELAY = 500;

// interface NotesClientProps {
//   initialPage: number;
//   initialSearch: string;
//   tag: string;
// }

// export default function NotesClient({ initialPage, initialSearch, tag }: NotesClientProps) {
//   const router = useRouter();

//   const [searchInput, setSearchInput] = useState(initialSearch);
//   const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
//   const [currentPage, setCurrentPage] = useState(initialPage);

//   // ---------------------------------------------
//   // Логіка дебаунсу пошукового запиту
//   // ---------------------------------------------
//   useEffect(() => {
//     if (searchInput === initialSearch) return;

//     const debouncerTimer = setTimeout(() => {
//       setDebouncedSearch(searchInput);
//       setCurrentPage(1);
//     }, DEBOUNCE_DELAY);

//     return () => clearTimeout(debouncerTimer);
//   }, [searchInput, initialSearch]);

//   // Фонова синхронізація локальних станів із URL-адресою браузера
//   // Використовуємо router.replace з scroll: false, щоб Next.js не
//   // перерендерив серверний компонент при швидких кліках
//   useEffect(() => {
//     const queryParams = new URLSearchParams();
//     queryParams.set("page", String(currentPage));
//     if (debouncedSearch) {
//       queryParams.set("search", debouncedSearch);
//     }
//     router.replace(`/notes/filter/${tag}?${queryParams.toString()}`, { scroll: false });
//   }, [debouncedSearch, currentPage, tag, router]);

//   // Запит useQuery тепер підписаний на ЛОКАЛЬНІ реактивні стани (currentPage, debouncedSearch)
//   // Додано прапорець isPlaceholderData, який вказує на момент фонової зміни сторінки пагінації
//   const { data, isFetching, isPlaceholderData } = useQuery({
//     queryKey: ["notes", currentPage, debouncedSearch, tag],
//     queryFn: () =>
//       fetchNotes({
//         page: currentPage,
//         perPage: NOTES_PER_PAGE,
//         search: debouncedSearch,
//         tag: tag,
//       }),
//     placeholderData: (previousData) => previousData,
//   });

//   // Обчислюємо, чи додаток зараз завантажує дані (чи активний процес отримання сторінки)
//   const isLoadingNextPage = isFetching || isPlaceholderData;

//   // Колбек для оновлення текста в інпуті
//   const handleSearchChange = useCallback((value: string) => {
//     setSearchInput(value);
//   }, []);

//   // Колбек для зміни сторінки пагінації (приймає чисте число)
//   // блокуємо кліки, якщо триває завантаження
//   const handlePageChange = useCallback(
//     (page: number) => {
//       if (isLoadingNextPage) return;
//       setCurrentPage(page);
//     },
//     [isLoadingNextPage],
//   );

//   // Глобальне перехоплення стрілок на клавіатурі з повним ігноруванням під час завантаження
//   useEffect(() => {
//     const handleKeyDown = (event: KeyboardEvent) => {
//       if (document.activeElement?.tagName === "INPUT") return;
//       if (!data || data.totalPages <= 1) return;
//       if (isLoadingNextPage) return; // Якщо сторінка вантажиться — ігноруємо клавіатуру повністю

//       if (event.key === "ArrowLeft") {
//         if (currentPage > 1) {
//           setCurrentPage((prev) => prev - 1);
//         }
//       } else if (event.key === "ArrowRight") {
//         if (currentPage < data.totalPages) {
//           setCurrentPage((prev) => prev + 1);
//         }
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [currentPage, data, isLoadingNextPage]);

//   return (
//     /*
//       Якщо йде завантаження (isLoadingNextPage), ми повністю відключаємо мишку через pointerEvents: "none".
//       Нічого на екрані не клікнеться фізично, доки дані не оновляться. Також додаємо напівпрозорість для гарного UX.
//     */
//     <div
//       className={css.app}
//       style={{
//         pointerEvents: isLoadingNextPage ? "none" : "auto",
//         opacity: isLoadingNextPage ? 0.6 : 1,
//         transition: "opacity 0.2s ease",
//         position: "relative",
//       }}
//     >
//       {/* Текстовий або графічний лоадер на весь екран тулбару, коли завантажуються нові дані */}
//       {isLoadingNextPage && (
//         <div
//           style={{
//             position: "absolute",
//             top: "16px",
//             right: "16px",
//             backgroundColor: "#0d6efd",
//             color: "white",
//             padding: "4px 12px",
//             borderRadius: "4px",
//             fontSize: "14px",
//             zIndex: 10,
//             boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//           }}
//         >
//           Loading, please wait...
//         </div>
//       )}

//       <div className={css.toolbar}>
//         {/* Початок рядка: Компонент пошуку нотаток (Контрольований) */}
//         <SearchBox onSearchChange={handleSearchChange} value={searchInput} />

//         {/* Середина рядка: Компонент пагінації (Контрольований) */}
//         {data && data.totalPages > 1 && (
//           <Pagination
//             pageCount={data.totalPages}
//             currentPage={currentPage}
//             onPageChange={handlePageChange}
//           />
//         )}

//         {/* Кінець рядка: Кнопка створення нотатки */}
//         <button
//           type="button"
//           className={css.button}
//           onClick={() => router.push("/notes/action/create")}
//           disabled={isLoadingNextPage} // Робимо кнопку неактивною при завантаженні
//         >
//           create note +
//         </button>
//       </div>

//       {data && data.notes.length === 0 && !isLoadingNextPage && (
//         <p className={css.emptyMessage}>
//           No notes found for <strong>{debouncedSearch || "this criteria"}</strong>. Create a new one
//           or try another search.
//         </p>
//       )}

//       {/* Список карток нотаток */}
//       {data && data.notes.length > 0 && <NoteList notes={data.notes} />}
//     </div>
//   );
// }

// =============================================
// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { useRouter } from "next/navigation";
// import { fetchNotes } from "@/lib/api";
// import NoteList from "@/components/NoteList/NoteList";
// import SearchBox from "@/components/SearchBox/SearchBox";
// import Pagination from "@/components/Pagination/Pagination";
// import css from "./NotesPage.module.css";

// // Глобальні константи налаштування сторінки
// const NOTES_PER_PAGE = 10;
// const DEBOUNCE_DELAY = 500;

// interface NotesClientProps {
//   initialPage: number;
//   initialSearch: string;
//   tag: string;
// }

// export default function NotesClient({ initialPage, initialSearch, tag }: NotesClientProps) {
//   const router = useRouter();

//   // Локальні стани для керування пошуком та пагінацією
//   const [searchInput, setSearchInput] = useState(initialSearch);
//   const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
//   const [currentPage, setCurrentPage] = useState(initialPage);

//   // Логіка дебаунсу пошукового запиту
//   useEffect(() => {
//     if (searchInput === initialSearch) return;

//     const debouncerTimer = setTimeout(() => {
//       setDebouncedSearch(searchInput);
//       setCurrentPage(1); // При новому пошуку повертаємо на першу сторінку
//     }, DEBOUNCE_DELAY);

//     return () => clearTimeout(debouncerTimer);
//   }, [searchInput, initialSearch]);

//   // Фонова синхронізація локальних станів із URL-адресою браузера
//   useEffect(() => {
//     const queryParams = new URLSearchParams();
//     queryParams.set("page", String(currentPage));
//     if (debouncedSearch) {
//       queryParams.set("search", debouncedSearch);
//     }
//     router.push(`/notes/filter/${tag}?${queryParams.toString()}`);
//   }, [debouncedSearch, currentPage, tag, router]);

//   // Запит useQuery підписаний на ЛОКАЛЬНІ реактивні стани (currentPage, debouncedSearch)
//   const { data } = useQuery({
//     queryKey: ["notes", currentPage, debouncedSearch, tag],
//     queryFn: () =>
//       fetchNotes({
//         page: currentPage,
//         perPage: NOTES_PER_PAGE,
//         search: debouncedSearch,
//         tag: tag,
//       }),
//     placeholderData: (previousData) => previousData,
//   });

//   // Колбек для оновлення текста в інпуті
//   const handleSearchChange = useCallback((value: string) => {
//     setSearchInput(value);
//   }, []);

//   // Колбек для зміни сторінки пагінації (приймає чисте число)
//   const handlePageChange = useCallback((page: number) => {
//     setCurrentPage(page);
//   }, []);

//   return (
//     <div className={css.app}>
//       <div className={css.toolbar}>
//         {/* 1. Початок рядка: Компонент пошуку нотаток (Контрольований) */}
//         <SearchBox onSearchChange={handleSearchChange} value={searchInput} />

//         {/* 2. Середина рядка: Компонент пагінації (Контрольований) */}
//         {data && data.totalPages > 1 && (
//           <Pagination
//             pageCount={data.totalPages}
//             currentPage={currentPage}
//             onPageChange={handlePageChange}
//           />
//         )}

//         {/* 3. Кінець рядка: Кнопка створення нотатки */}
//         <button
//           type="button"
//           className={css.button}
//           onClick={() => router.push("/notes/action/create")}
//         >
//           create note +
//         </button>
//       </div>

//       {data && data.notes.length === 0 && (
//         <p className={css.emptyMessage}>
//           No notes found for <strong>{debouncedSearch || "this criteria"}</strong>. Create a new one
//           or try another search.
//         </p>
//       )}

//       {/* Список карток нотаток */}
//       {data && data.notes.length > 0 && <NoteList notes={data.notes} />}
//     </div>
//   );
// }
