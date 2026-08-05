// app/(private routes)/@modal/(.)notes/[id]/NotePreview.client.tsx
// ==========================================================
// Клієнтський компонент NotePreviewClient
// Реалізація функціоналу картки з обгорткою в компонент Modal
// Клієнтський компонент для відображення швидкого прев'ю вмісту нотатки
// ==========================================================
// === Паралельні маршрути для фільтрації нотаток за тегом] ===

"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { fetchNoteById } from "@/lib/api/clientApi";
import Modal from "@/components/Modal/Modal";
import type { Note } from "@/types/note";
import css from "@/components/NotePreview/NotePreview.module.css";

// КОНСТАНТА КЛЮЧА КЕШУВАННЯ ДЛЯ СИНХРОНІЗАЦІЇ ІЗ СЕРВЕРОМ
const NOTE_QUERY_KEY = "note";

// ТИПІЗАЦІЯ ВХІДНИХ ПАРАМЕТРІВ ПРЕВ'Ю КОМПОНЕНТА
interface NotePreviewClientProps {
  noteId: string;
}

// ГОЛОВНИЙ КЛІЄНТСЬКИЙ КОМПОНЕНТ ДЛЯ ДЕТАЛЕЙ У МОДАЛЬНОМУ ВІКНІ
export default function NotePreviewClient({ noteId }: NotePreviewClientProps) {
  const router = useRouter();

  // ОТРИМАННЯ ДАНИХ ІЗ СЕРВЕРНОГО КЕШУ БЕЗ ПОВТОРНОГО ПЕРЕЗАВАНТАЖЕННЯ ЗАПИТУ
  const { data: currentNote, isLoading } = useQuery<Note>({
    queryKey: [NOTE_QUERY_KEY, noteId],
    queryFn: () => fetchNoteById(noteId),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // ФУНКЦІЯ ДЛЯ ПОВЕРНЕННЯ НАЗАД ПРИ ЗАКРИТТІ МОДАЛЬНОГО ВІКНА
  const handleCloseModal = () => {
    router.back();
  };

  // СТАН ЗАВАНТАЖЕННЯ ТА ОБРОБКА ВІДСУТНОСТІ ДАНИХ
  if (isLoading)
    return <div style={{ padding: "2rem", color: "#fff" }}>Loading note details...</div>;
  if (!currentNote) return <div style={{ padding: "2rem", color: "#fff" }}>Note not found</div>;

  return (
    <Modal isOpen={true} onClose={handleCloseModal}>
      <div className={css.container}>
        <div className={css.item}>
          {/* ШAПКА МОДАЛЬНОГО ВІКНА З НАЗВОЮ ТA ТЕГОМ НОТАТКИ */}
          <header className={css.header}>
            <h2>{currentNote.title}</h2>
            {currentNote.tag && <span className={css.tag}>{currentNote.tag}</span>}
          </header>

          {/* ОСНОВНИЙ ТЕКСТОВИЙ ВМІСТ ОБРАНОЇ НОТАТКИ */}
          <p className={css.content}>{currentNote.content}</p>

          {/* ДАТА СТВОРЕННЯ ЗАПИСУ КОРИСТУВАЧЕМ */}
          <div className={css.date}>{new Date(currentNote.createdAt).toLocaleDateString()}</div>
        </div>
      </div>
    </Modal>
  );
}
