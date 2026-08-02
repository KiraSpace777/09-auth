// app/@modal/(.)notes/[id]/NotePreview.client.tsx
// ==========================================================
// Клієнтський компонент NotePreviewClient
// Реалізація функціоналу картки з обгорткою в компонент Modal
// ==========================================================
// === [ДЗ 7: Паралельні маршрути для фільтрації нотаток за тегом] ===

"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { fetchNoteById } from "@/lib/api"; // Використовуємо функцію для ОДНІЄЇ нотатки
import Modal from "@/components/Modal/Modal";
import type { Note } from "@/types/note";
import css from "@/components/NotePreview/NotePreview.module.css"; // Беремо готові стилі картки

// Виносимо префікс ключа кешу в константи
const NOTE_QUERY_KEY = "note";

interface NotePreviewClientProps {
  noteId: string;
}

export default function NotePreviewClient({ noteId }: NotePreviewClientProps) {
  const router = useRouter();

  // Використовуємо той самий ключ і функцію, що й серверний prefetch
  // Це миттєво візьме дані з кешу без помилки 400 та без повторного запиту!
  const { data: currentNote, isLoading } = useQuery<Note>({
    queryKey: [NOTE_QUERY_KEY, noteId],
    queryFn: () => fetchNoteById(noteId),
    // Явно вимикаємо повторне отримання даних при відкритті модального вікна поки відсутня ИД нотатки
    refetchOnMount: false,
  });

  const handleCloseModal = () => {
    router.back();
  };

  if (isLoading) return <div>Loading note details...</div>;
  if (!currentNote) return <div>Note not found</div>;

  return (
    <Modal isOpen={true} onClose={handleCloseModal}>
      <div className={css.container}>
        <div className={css.item}>
          <header className={css.header}>
            <h2>{currentNote.title}</h2>
            {currentNote.tag && <span className={css.tag}>{currentNote.tag}</span>}
          </header>
          <p className={css.content}>{currentNote.content}</p>
          <div className={css.date}>{new Date(currentNote.createdAt).toLocaleDateString()}</div>
        </div>
      </div>
    </Modal>
  );
}
