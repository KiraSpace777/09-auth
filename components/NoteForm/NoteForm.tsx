// ============================================================================
// Нативна форма створення / редагування нотатки (Компонент NoteForm)
// ОНОВЛЕНО: Повністю адаптовано під суворі вимоги ТЗ із файлу «Збереження draft»
// ============================================================================

"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { createNote } from "@/lib/api";
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

// // ============================================================================
// // Нативна форма створення / редагування нотатки (Компонент NoteForm)
// // РЕФАКТОРИНГ: Повністю видалено Formik, форма працює нативно через HTML5 та FormData
// // ============================================================================

// "use client";

// import { useEffect, useState } from "react";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useRouter } from "next/navigation";

// import { createNote } from "@/lib/api";
// import { Note, CreateNoteData } from "@/types/note";

// import css from "./NoteForm.module.css";

// interface NoteFormProps {
//   onClose?: () => void; // Проп необов'язковий для універсальності (модалка чи сторінка)
// }

// export default function NoteForm({ onClose }: NoteFormProps) {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   // Локальні стейти для виведення помилок валідації (заміна ErrorMessage з Formik)
//   const [titleError, setTitleError] = useState<string>("");
//   const [contentError, setContentError] = useState<string>("");

//   /* Універсальна функція для виходу з режиму створення / закриття форми */
//   const handleClose = (): void => {
//     if (onClose) {
//       onClose(); // Закриваємо модалку, якщо форму викликано в ній
//     } else {
//       router.push("/notes/filter/all"); // Перенаправляємо на сторінку "всі нотатки" без фільтру
//     }
//   };

//   /* Слухач клавіші Escape для виходу з режиму створення нотатки */
//   useEffect(() => {
//     const handleKeyDown = (event: KeyboardEvent): void => {
//       if (event.key === "Escape") {
//         handleClose();
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [onClose, router]); // eslint-disable-line react-hooks/exhaustive-deps

//   /* Налаштування мутації TanStack Query для збереження нотатки */
//   const createMutation = useMutation<Note, Error, CreateNoteData>({
//     mutationFn: (newNote: CreateNoteData) => createNote(newNote),
//     onSuccess: () => {
//       /* Інвалідуємо кеш, щоб оновити список нотаток */
//       queryClient.invalidateQueries({ queryKey: ["notes"] });
//       /* Викликаємо автоматичне закриття форми або редірект */
//       handleClose();
//     },
//   });

//   /* Обробник відправки нативної форми за допомогою Next.js formAction */
//   const handleSubmitAction = (formData: FormData) => {
//     // Скидаємо попередні помилки валідації перед новою перевіркою
//     setTitleError("");
//     setContentError("");

//     // Нативно зчитуємо значення полів через атрибут name
//     const title = formData.get("title") as string;
//     const content = formData.get("content") as string;
//     const tag = formData.get("tag") as CreateNoteData["tag"];

//     // Клієнтська валідація, що повністю відповідає колишнім правилам Yup
//     if (!title || title.trim().length < 3) {
//       setTitleError("Title must be at least 3 characters");
//       return;
//     }
//     if (title.length > 50) {
//       setTitleError("Title cannot exceed 50 characters");
//       return;
//     }
//     if (content && content.length > 500) {
//       setContentError("Content cannot exceed 500 characters");
//       return;
//     }

//     // Якщо валідація успішна — викликаємо мутацію для відправки на бекенд
//     createMutation.mutate({ title, content, tag });
//   };

//   return (
//     // Замінено Form на стандартну HTML-форму з використанням атрибуту action
//     <form action={handleSubmitAction} className={css.form}>
//       {/* Поле введення заголовка нотатки */}
//       <div className={css.formGroup}>
//         <label htmlFor="title">Title</label>
//         <input
//           id="title"
//           type="text"
//           name="title"
//           className={css.input}
//           placeholder="Enter note title..."
//           required
//         />
//         {/* Виведення помилки валідації заголовка */}
//         {titleError && <span className={css.error}>{titleError}</span>}
//       </div>

//       {/* Текстова область вмісту нотатки */}
//       <div className={css.formGroup}>
//         <label htmlFor="content">Content</label>
//         <textarea
//           id="content"
//           name="content"
//           rows={8}
//           className={css.textarea}
//           placeholder="Enter note content..."
//         />
//         {/* Виведення помилки валідації контенту */}
//         {contentError && <span className={css.error}>{contentError}</span>}
//       </div>

//       {/* Вибір тегу категорії нотатки */}
//       <div className={css.formGroup}>
//         <label htmlFor="tag">Tag</label>
//         <select id="tag" name="tag" className={css.select} defaultValue="Work">
//           <option value="Todo">Todo</option>
//           <option value="Work">Work</option>
//           <option value="Personal">Personal</option>
//           <option value="Meeting">Meeting</option>
//           <option value="Shopping">Shopping</option>
//         </select>
//       </div>

//       {/* Панель дій форми (Кнопки Cancel та Create) */}
//       <div className={css.actions}>
//         <button type="button" className={css.cancelButton} onClick={handleClose}>
//           Cancel
//         </button>
//         <button type="submit" className={css.submitButton} disabled={createMutation.isPending}>
//           {createMutation.isPending ? "Saving..." : "Create note"}
//         </button>
//       </div>
//     </form>
//   );
// }

// =============================ДЗ 7=========================================
// "use client";

// import { Formik, Form, Field, ErrorMessage as FormikError } from "formik";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import * as Yup from "yup";
// import { useRouter } from "next/navigation";

// import { createNote } from "@/lib/api";
// import type { Note, CreateNoteData } from "@/types/note";

// import css from "./NoteForm.module.css";

// // ДЗ-08
// interface NoteFormProps {
//   onClose?: () => void;
// }
// // ДЗ-07
// // interface NoteFormProps {
// //   onClose: () => void;
// // }

// /* Правила валідації полів форми за допомогою бібліотеки Yup */
// const NoteValidationSchema = Yup.object().shape({
//   title: Yup.string()
//     .min(3, "Minimum 3 characters")
//     .max(50, "Maximum 50 characters")
//     .required("Title is a required field"),
//   content: Yup.string().max(500, "Maximum 500 characters"),
//   tag: Yup.string()
//     .oneOf(["Todo", "Work", "Personal", "Meeting", "Shopping"], "Invalid tag selection")
//     .required("Tag is a required field"),
// });

// export default function NoteForm({ onClose }: NoteFormProps) {
//   /* Підключаємо інструменти для роботи з глобальним кешем та сервісом запитів */
//   const queryClient = useQueryClient();

//   const router = useRouter();

//   /* Задаємо початкові порожні значення для полів форми, які Formik візьме при запуску */
//   const initialValues: CreateNoteData = {
//     title: "",
//     content: "",
//     tag: "Work",
//   };

//   /* Налаштування мутації для створення та інвалідації нотатки: виконання запиту та оновлення інтерфейсу */
//   const createMutation = useMutation<Note, Error, CreateNoteData>({
//     /* Передаємо чисті дані форми безпосередньо в axios-сервіс через єдиний проксі */
//     mutationFn: (newNote: CreateNoteData) => createNote(newNote),
//     /* Якщо сервер успішно створив нотатку — запускаємо сценарій очищення та закриття */
//     onSuccess: () => {
//       /* Скидаємо кеш нотаток, щоб головна сторінка автоматично підтягнула нову картку */
//       queryClient.invalidateQueries({ queryKey: ["notes"] });
//       /* Закриваємо модальне вікно, повертаємо користувача до списку нотаток */

//       /* Перевіряємо сценарій використання форми: у модалці чи на окремій сторінці */
//       if (onClose) {
//         onClose();
//       } else {
//         router.push("/notes/filter/all"); // Повертаємо користувача до списку після створення
//       }

//       // onClose();
//     },
//   });

//   /* Перехоплення перевірених даних з Formik і перенаправлення їх до функції мутації */
//   const handleFormikSubmit = (values: CreateNoteData): void => {
//     createMutation.mutate(values);
//   };

//   return (
//     /* Ініціалізація Formik, передача початкових станів, схеми валідації Yup та функції надсилання */
//     <Formik
//       initialValues={initialValues}
//       validationSchema={NoteValidationSchema}
//       onSubmit={handleFormikSubmit}
//     >
//       {/* Рендеринг HTML-форми із застосуванням модульних стилів */}
//       <Form className={css.form}>
//         {/* Поле для введення заголовка нотатки */}
//         <div className={css.formGroup}>
//           <label htmlFor="title">Title</label>
//           <Field id="title" type="text" name="title" className={css.input} />
//           {/* Якщо є помилка валідації заголовка — Formik сам відмалює її червоним текстом у span */}
//           <FormikError name="title" component="span" className={css.error} />
//         </div>

//         {/* Текстова область для введення основного змісту */}
//         <div className={css.formGroup}>
//           <label htmlFor="content">Content</label>
//           <Field id="content" as="textarea" name="content" rows={8} className={css.textarea} />
//           <FormikError name="content" component="span" className={css.error} />
//         </div>

//         {/* Випадаючий список для вибору категорії (тегу) нотатки */}
//         <div className={css.formGroup}>
//           <label htmlFor="tag">Tag</label>
//           <Field id="tag" as="select" name="tag" className={css.select}>
//             <option value="Todo">Todo</option>
//             <option value="Work">Work</option>
//             <option value="Personal">Personal</option>
//             <option value="Meeting">Meeting</option>
//             <option value="Shopping">Shopping</option>
//           </Field>
//           <FormikError name="tag" component="span" className={css.error} />
//         </div>

//         {/* Блок із кнопками відміна / створення нотатки в нижній частині форми */}
//         <div className={css.actions}>
//           <button type="button" className={css.cancelButton} onClick={onClose}>
//             Cancel
//           </button>
//           <button type="submit" className={css.submitButton} disabled={createMutation.isPending}>
//             {createMutation.isPending ? "Saving..." : "Create note"}
//           </button>
//         </div>
//       </Form>
//     </Formik>
//   );
// }
