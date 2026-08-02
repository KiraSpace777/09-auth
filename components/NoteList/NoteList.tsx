// ======================================================
// Компонент NoteList
// ======================================================
// відповідає лише за відображення списку нотаток та
// дозволи на видалення конкретного елементу нотаток.
// ------------------------------------------------------

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { deleteNote } from "@/lib/api";
import type { Note } from "@/types/note";
import css from "./NoteList.module.css";

// пропси onDelete та isDeleting повністю видалено
interface NoteListProps {
  notes: Note[];
}

export default function NoteList({ notes }: NoteListProps) {
  const queryClient = useQueryClient();

  // Мутація перенесена з Notes.client.tsx
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteNote(id);
    },
    onSuccess: () => {
      // Автоматично оновлюємо список нотаток у кеші після видалення
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  return (
    <ul className={css.list}>
      {notes.map((note) => (
        <li key={note.id} className={css.listItem}>
          <div>
            <h3 className={css.title}>{note.title}</h3>
            <p className={css.content}>{note.content}</p>
          </div>

          <div className={css.footer}>
            <span className={css.tag}>{note.tag}</span>

            <Link href={`/notes/${note.id}`} className={css.link}>
              View details
            </Link>

            {/* використовуємо стан деліту з локальної мутації */}
            <button
              type="button"
              className={css.button}
              onClick={() => deleteMutation.mutate(note.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
