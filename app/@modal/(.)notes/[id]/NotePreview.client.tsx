// app/@modal/(.)notes/[id]/NotePreview.client.tsx
// =========================================================
// Клієнтський компонент NotePreviewClient
// Реалізація функціоналу картки з обгорткою в компонент Modal
// Клієнтський компонент для відображення швидкого прев'ю вмісту нотатки
// === Паралельні маршрути для фільтрації нотаток за тегом ===

// app/@modal/(.)notes/[id]/NotePreview.client.tsx
// =========================================================
// Клієнтський компонент швидкого перегляду картки нотатки в модальному вікні

"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { fetchNoteById } from "@/lib/api/clientApi";
import Modal from "@/components/Modal/Modal";
import type { Note } from "@/types/note";
import css from "@/components/NotePreview/NotePreview.module.css";

const NOTE_QUERY_KEY = "note";
const LOADING_MESSAGE_STYLES = { padding: "32px", color: "#ffffff" };

interface NotePreviewClientProps {
  noteId: string;
}

export default function NotePreviewClient({ noteId }: NotePreviewClientProps) {
  const router = useRouter();

  const { data: currentNote, isLoading } = useQuery<Note>({
    queryKey: [NOTE_QUERY_KEY, noteId],
    queryFn: () => fetchNoteById(noteId),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const handleCloseModal = () => {
    router.back();
  };

  if (isLoading) return <div style={LOADING_MESSAGE_STYLES}>Loading note details...</div>;
  if (!currentNote) return <div style={LOADING_MESSAGE_STYLES}>Note not found</div>;

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
        <button type="button" className={css.backBtn} onClick={handleCloseModal}>
          Close Preview
        </button>
      </div>
    </Modal>
  );
}
