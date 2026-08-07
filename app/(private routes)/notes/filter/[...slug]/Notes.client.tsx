// app/(private routes)/notes/filter/[...slug]/Notes.client.tsx
// ============================================================
// Клієнтський компонент відображення та інтерактивного пошуку нотаток

"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { fetchNotes } from "@/lib/api/clientApi";
import NoteList from "@/components/NoteList/NoteList";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";
import css from "./NotesPage.module.css";

const NOTES_PER_PAGE = 10;
const DEBOUNCE_DELAY = 500;
const CREATE_NOTE_ROUTE = "/notes/action/create";

// СТИЛІ ДЛЯ ПЛАВНОЇ ЗМІНИ СТАНУ ЗАВАНТАЖЕННЯ БЕЗ МИГОТІННЯ КОНТЕНТУ
const FETCHING_ACTIVE_STYLES = {
  pointerEvents: "none" as const,
  opacity: 0.6,
  transition: "opacity 0.25s ease-in-out",
};

const FETCHING_IDLE_STYLES = {
  pointerEvents: "auto" as const,
  opacity: 1,
  transition: "opacity 0.25s ease-in-out",
};

interface NotesClientProps {
  tag: string;
}

export default function NotesClient({ tag }: NotesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const initialPage = Number(searchParams.get("page")) || 1;

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);

  useEffect(() => {
    if (searchInput === initialSearch) return;
    const debounceTimer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(debounceTimer);
  }, [searchInput, initialSearch]);

  const { data, isFetching } = useQuery({
    queryKey: ["notes", currentPage, debouncedSearch, tag],
    queryFn: () =>
      fetchNotes({
        page: currentPage,
        perPage: NOTES_PER_PAGE,
        search: debouncedSearch,
        tag,
      }),
    placeholderData: (previousData) => previousData, // ЗБЕРІГАЄ СТАРІ НОТАТКИ НА ЕКРАНІ ПІД ЧАС ЗАВАНТАЖЕННЯ НОВИХ
  });

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const urlPage = params.get("page");
    const urlSearch = params.get("search") || "";

    if (urlPage === String(currentPage) && urlSearch === debouncedSearch) {
      return;
    }

    params.set("page", String(currentPage));
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, [currentPage, debouncedSearch, pathname, router, searchParams]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return (
    // ДИНАМІЧНО КЕРУЄМО СТИЛЯМИ ТРАНЗИЦІЇ ЗАМІСТЬ ПОВНОГО ВИДАЛЕННЯ КОМПОНЕНТА З DOM
    <div style={isFetching ? FETCHING_ACTIVE_STYLES : FETCHING_IDLE_STYLES} className={css.app}>
      <div className={css.toolbar}>
        <SearchBox onSearchChange={handleSearchChange} value={searchInput} />

        {data && data.totalPages > 1 && (
          <Pagination
            pageCount={data.totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}

        <Link href={CREATE_NOTE_ROUTE} className={css.button}>
          create note +
        </Link>
      </div>

      {/* ВИДАЛЕНО ПОВНЕ РОЗМОНТУВАННЯ ЧЕРЕЗ ISFETCHING */}
      {data?.notes?.length === 0 ? (
        <p className={css.emptyMessage}>
          No notes found for <strong>{debouncedSearch || "this criteria"}</strong>. Create a new one
          or try another search.
        </p>
      ) : (
        <NoteList notes={data?.notes || []} />
      )}
    </div>
  );
}

// ================================================================================
// // ==========================================================
// // NotesClient - робота з CSR рендерингом
// // CSR (Client-Side Rendering): "use client"
// // ==========================================================
// // У клієнтському компоненті NotesClient потрібно отримати пропс tag та використати його в useQuery.
// // Паралельні маршрути для фільтрації нотаток за тегом
// // ----------------------------------------------------------
// // app/(private routes)/notes/filter/[...slug]/notes.client.tsx

// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { useSearchParams, useRouter, usePathname } from "next/navigation";
// import Link from "next/link";
// import { fetchNotes } from "@/lib/api/clientApi";
// import NoteList from "@/components/NoteList/NoteList";
// import SearchBox from "@/components/SearchBox/SearchBox";
// import Pagination from "@/components/Pagination/Pagination";
// import Loading from "@/app/loading";
// import css from "./NotesPage.module.css";

// const NOTES_PER_PAGE = 10;
// const DEBOUNCE_DELAY = 500;
// const CREATE_NOTE_ROUTE = "/notes/action/create";

// interface NotesClientProps {
//   tag: string;
// }

// export default function NotesClient({ tag }: NotesClientProps) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   const initialSearch = searchParams.get("search") || "";
//   const initialPage = Number(searchParams.get("page")) || 1;

//   const [searchInput, setSearchInput] = useState(initialSearch);
//   const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
//   const [currentPage, setCurrentPage] = useState(initialPage);

//   useEffect(() => {
//     if (searchInput === initialSearch) return;
//     const debounceTimer = setTimeout(() => {
//       setDebouncedSearch(searchInput);
//       setCurrentPage(1);
//     }, DEBOUNCE_DELAY);
//     return () => clearTimeout(debounceTimer);
//   }, [searchInput, initialSearch]);

//   const { data, isFetching } = useQuery({
//     queryKey: ["notes", currentPage, debouncedSearch, tag],
//     queryFn: () =>
//       fetchNotes({
//         page: currentPage,
//         perPage: NOTES_PER_PAGE,
//         search: debouncedSearch,
//         tag,
//       }),
//     placeholderData: (previousData) => previousData,
//   });

//   // ВИПРАВЛЕНО: ДОДАНО СУВОРУ ПЕРЕВІРКУ НАЯВНИХ ПАРАМЕТРІВ ДЛЯ ЗАПОБІГАННЯ БЕЗКІНЕЧНОМУ ЗАЦИКЛЕННЮ ЗАПИТІВ
//   useEffect(() => {
//     const params = new URLSearchParams(searchParams.toString());
//     const urlPage = params.get("page");
//     const urlSearch = params.get("search") || "";

//     // ЯКЩО ЗНАЧЕННЯ В URL ВЖЕ ЗБІГАЮТЬСЯ ЗІ СТАНОМ, ЗУПИНЯЄМО ВИКОНАННЯ
//     if (urlPage === String(currentPage) && urlSearch === debouncedSearch) {
//       return;
//     }

//     params.set("page", String(currentPage));
//     if (debouncedSearch) {
//       params.set("search", debouncedSearch);
//     } else {
//       params.delete("search");
//     }
//     router.replace(`${pathname}?${params.toString()}`);
//   }, [currentPage, debouncedSearch, pathname, router, searchParams]);

//   const handleSearchChange = useCallback((value: string) => {
//     setSearchInput(value);
//   }, []);

//   const handlePageChange = useCallback((page: number) => {
//     setCurrentPage(page);
//   }, []);

//   return (
//     <div
//       className={css.app}
//       style={{
//         pointerEvents: isFetching ? "none" : "auto",
//         opacity: isFetching ? 0.8 : 1,
//         transition: "opacity 0.2s ease",
//       }}
//     >
//       <div className={css.toolbar}>
//         <SearchBox onSearchChange={handleSearchChange} value={searchInput} />

//         {data && data.totalPages > 1 && (
//           <Pagination
//             pageCount={data.totalPages}
//             currentPage={currentPage}
//             onPageChange={handlePageChange}
//           />
//         )}

//         <Link href={CREATE_NOTE_ROUTE} className={css.button}>
//           create note +
//         </Link>
//       </div>

//       {isFetching ? (
//         <Loading />
//       ) : data?.notes?.length === 0 ? (
//         <p className={css.emptyMessage}>
//           No notes found for <strong>{debouncedSearch || "this criteria"}</strong>. Create a new one
//           or try another search.
//         </p>
//       ) : (
//         <NoteList notes={data?.notes || []} />
//       )}
//     </div>
//   );
// }
