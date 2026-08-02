"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import css from "./Modal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  // Налаштування глобальних подій браузера та поведінки сторінки при відкритті модалки
  useEffect(() => {
    // Якщо вікно закрите — нічого не робимо і слухачі не вішаємо
    if (!isOpen) return;

    // Створюємо функцію-обробник, яка закриє модалку при натисканні на кнопку Escape
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    // Додаємо слухач подій на все вікно браузера для відстеження кнопки Escape
    window.addEventListener("keydown", handleKeyDown);
    // Повністю блокуємо прокрутку (скрол) заднього фону сайту, поки відкрита модалка
    document.body.style.overflow = "hidden";

    // Функція очищення: автоматично спрацьовує, коли модалка закривається або видаляється з екрана
    return () => {
      // знімаємо глобальний слухач клавіатури, щоб не засмічувати пам'ять браузера
      window.removeEventListener("keydown", handleKeyDown);
      // повертаємо стандартну прокрутку сторінки сайту назад у первісний стан
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Функція для закриття модалки при кліку на сірий фон (бекдроп)
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Використовуємо createPortal, щоб винести і відмалювати модалку в самому кінці тегу body, поза основним деревом React
  return createPortal(
    <div
      className={css.backdrop}
      role="dialog"
      aria-modal="true" // Позначаємо, що вміст під вікном є неактивним для доступності (accessibility)
      onClick={handleBackdropClick}
    >
      {/* Контейнер нового вікна, куди через пропс children передаємо вміст із дочірнього елемента (форма NoteForm) */}
      <div className={css.modal}>{children}</div>
    </div>,
    document.body, // Суворе місце призначення порталу в реальному DOM екрану
  );
}
