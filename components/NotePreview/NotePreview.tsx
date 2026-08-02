// components/NotePreview/NotePreview.tsx
// ==========================================================
// NotePreview - компонент детального перегляду контенту нотатки
// Client Component: "use client"
// ==========================================================
"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { fetchNotes } from "@/lib/api";
import Loading from "@/app/loading";
import NotFound from "@/app/not-found";

import type { FetchNotesResponse } from "@/lib/api";
import type { Note } from "@/types/note";
import css from "./NotePreview.module.css";

// Константи конфігурації параметрів
const DEFAULT_PAGE = 1;
const MAX_PER_PAGE_FOR_CACHE = 100;

interface NotePreviewProps {
  noteId: string;
}

export default function NotePreview({ noteId }: NotePreviewProps) {
  const router = useRouter();

  // Запитуємо дані нотаток, щоб миттєво підхопити їх із наявного кешу
  const { data, isLoading } = useQuery<FetchNotesResponse>({
    queryKey: ["notes"],
    queryFn: () => fetchNotes({ page: DEFAULT_PAGE, perPage: MAX_PER_PAGE_FOR_CACHE }),
  });

  // Находимо конкретну нотатку за переданим noteId
  const currentNote = data?.notes?.find((note: Note) => note.id === noteId);

  if (isLoading) return <Loading />;
  if (!currentNote) return <NotFound />;

  return (
    <div className={css.container}>
      {/* Кнопка повернення назад по історії URL згідно зі стилем .backBtn */}
      <button type="button" className={css.backBtn} onClick={() => router.back()}>
        Back to list
      </button>

      <div className={css.item}>
        {/* Шапка картки з каскадним селектором для h2 */}
        <header className={css.header}>
          <h2>{currentNote.title}</h2>
          {currentNote.tag && <span className={css.tag}>{currentNote.tag}</span>}
        </header>

        {/* Текст нотатки із збереженням переносів рядків (.content) */}
        <p className={css.content}>{currentNote.content}</p>

        {/* Дата створення нотатки, вирівняна по правому краю */}
        <div className={css.date}>{new Date(currentNote.createdAt).toLocaleDateString()}</div>
      </div>
    </div>
  );
}
