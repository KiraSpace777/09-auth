// ============================================================================
// Серверна сторінка створення нової нотатки (Маршрут )
// Створює окремий повноцінний маршрут згідно з вимогами ДЗ.
// ============================================================================
// app/notes/action/create/page.tsx

import type { Metadata } from "next";
import NoteForm from "@/components/NoteForm/NoteForm";
import css from "./CreateNote.module.css";

const META_OG_URL_MAIN = "https://notehub.com/notes/action/create";
const META_OG_URL_IMG = "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg";
const META_OG_IMG_W = 1200;
const META_OG_IMG_H = 630;

export const metadata: Metadata = {
  title: "Create Note | NoteHub",
  description: "Page for creating a new note in the NoteHub application.",
  openGraph: {
    title: "Create Note | NoteHub",
    description: "Page for creating a new note in the NoteHub application.",
    url: META_OG_URL_MAIN,
    images: [
      {
        url: META_OG_URL_IMG,
        width: META_OG_IMG_W,
        height: META_OG_IMG_H,
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
