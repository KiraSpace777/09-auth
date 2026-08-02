// ============================================================================
// Серверна сторінка створення нової нотатки (Маршрут )
// Створює окремий повноцінний маршрут згідно з вимогами ДЗ.
// ============================================================================
// app/notes/action/create/page.tsx

import type { Metadata } from "next";
import NoteForm from "@/components/NoteForm/NoteForm";
import css from "./CreateNote.module.css";

export const metadata: Metadata = {
  title: "Create Note | NoteHub",
  description: "Page for creating a new note in the NoteHub application.",
  openGraph: {
    title: "Create Note | NoteHub",
    description: "Page for creating a new note in the NoteHub application.",
    url: "https://notehub.com/notes/action/create",
    images: [
      {
        url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
        width: 1200,
        height: 630,
        alt: "Create note page on NoteHub",
      },
    ],
  },
};

export default function CreateNote() {
  return (
    <main className={css.main}>
      <div className={css.container}>
        <h1 className={css.title}>Create note</h1>

        {/* Компонент нативної форми без Formik із підтримкою Zustand чорнетки */}
        <NoteForm />
      </div>
    </main>
  );
}
