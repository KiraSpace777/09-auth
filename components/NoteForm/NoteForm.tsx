// ============================================================================
// Нативна форма створення / редагування нотатки (Компонент NoteForm)
// ОНОВЛЕНО: Повністю адаптовано під суворі вимоги ТЗ із файлу «Збереження draft»
// ============================================================================

"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { createNote } from "@/lib/api/clientApi";
import { Note, CreateNoteData } from "@/types/note";
import { useNoteStore } from "@/lib/store/noteStore"; // Оновлений правильний імпорт стору

import css from "./NoteForm.module.css";

interface NoteFormProps {
  onClose?: () => void;
}

export default function NoteForm({ onClose }: NoteFormProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Дістаємо дані та методи строго згідно з назвами у ТЗ
  const { draft, setDraft, clearDraft } = useNoteStore();

  // Локальні стейти для виведення помилок валідації
  const [titleError, setTitleError] = useState<string>("");
  const [contentError, setContentError] = useState<string>("");

  /* Обробник натискання кнопки Cancel — повертає на попередній маршрут без очищення draft */
  const handleCancelAction = (): void => {
    if (onClose) {
      onClose();
    } else {
      router.back(); // СУВОРА ВИМОГА ДЗ: повернення на попередній маршрут
    }
  };

  /* Універсальна функція закриття після успішного сабміту (веде на filter/all) */
  const handleSuccessNavigation = (): void => {
    if (onClose) {
      onClose();
    } else {
      router.push("/notes/filter/all"); // Використовуємо push, щоб побачити нову нотатку
    }
  };

  /* Слухач клавіші Escape для скасування режиму створення (користувач повертається назад) */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        handleCancelAction();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, router]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Налаштування мутації TanStack Query для збереження нотатки */
  const createMutation = useMutation<Note, Error, CreateNoteData>({
    mutationFn: (newNote: CreateNoteData) => createNote(newNote),
    onSuccess: () => {
      /* 1. Інвалідуємо кеш за допомогою хука useQueryClient */
      queryClient.invalidateQueries({ queryKey: ["notes"] });

      /* 2. Очищаємо draft через метод clearDraft (Вимога ДЗ) */
      clearDraft();

      /* 3. Перенаправляємо користувача на маршрут /notes/filter/all */
      handleSuccessNavigation();
    },
  });

  /* Обробник відправки нативної форми за допомогою Next.js formAction */
  const handleSubmitAction = (formData: FormData) => {
    setTitleError("");
    setContentError("");

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const tag = formData.get("tag") as CreateNoteData["tag"];

    if (!title || title.trim().length < 3) {
      setTitleError("Title must be at least 3 characters");
      return;
    }
    if (title.length > 50) {
      setTitleError("Title cannot exceed 50 characters");
      return;
    }
    if (content && content.length > 500) {
      setContentError("Content cannot exceed 500 characters");
      return;
    }

    createMutation.mutate({ title, content, tag });
  };

  return (
    <form action={handleSubmitAction} className={css.form}>
      {/* Поле введення заголовка нотатки */}
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          name="title"
          className={css.input}
          placeholder="Enter note title..."
          required
          // СУВОРА ВИМОГА ДЗ: підставляємо значення в defaultValue
          defaultValue={draft.title}
          // Кожна зміна оновлює відповідне поле в Zustand, зберігаючи інші поля
          onChange={(event) => setDraft({ title: event.target.value })}
        />
        {titleError && <span className={css.error}>{titleError}</span>}
      </div>

      {/* Текстова область вмісту нотатки */}
      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          rows={8}
          className={css.textarea}
          placeholder="Enter note content..."
          // СУВОРА ВИМОГА ДЗ: підставляємо значення в defaultValue
          defaultValue={draft.content}
          // Кожна зміна оновлює відповідне поле в Zustand, зберігаючи інші поля
          onChange={(event) => setDraft({ content: event.target.value })}
        />
        {contentError && <span className={css.error}>{contentError}</span>}
      </div>

      {/* Вибір тегу категорії нотатки */}
      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>
        <select
          id="tag"
          name="tag"
          className={css.select}
          // СУВОРА ВИМОГА ДЗ: підставляємо значення в defaultValue
          defaultValue={draft.tag}
          // Кожна зміна оновлює відповідне поле в Zustand, зберігаючи інші поля
          onChange={(event) => setDraft({ tag: event.target.value as CreateNoteData["tag"] })}
        >
          <option value="Todo">Todo</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Shopping">Shopping</option>
        </select>
      </div>

      {/* Панель дій форми (Кнопки Cancel та Create) */}
      <div className={css.actions}>
        <button
          type="button"
          className={css.cancelButton}
          onClick={handleCancelAction} // Викликає повернення назад без очищення стору
        >
          Cancel
        </button>
        <button type="submit" className={css.submitButton} disabled={createMutation.isPending}>
          {createMutation.isPending ? "Saving..." : "Create note"}
        </button>
      </div>
    </form>
  );
}
