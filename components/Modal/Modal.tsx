// components/Modal/Modal.tsx
// =============================
// Універсальний компонент модального вікна з використанням React Portal

"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import css from "./Modal.module.css";

// ТИПІЗАЦІЯ ПРОПСІВ ДЛЯ МОДАЛЬНОГО ВІКНА
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode; // ВИПРАВЛЕНО: ВИКОРИСТОВУЄМО ТІЛЬКИ ВАЛІДНИЙ СТАНДАРТНИЙ ТИП REACT
}

// КЛІЄНТСЬКИЙ КОМПОНЕНТ ОБГОРТКИ МОДАЛЬНОГО ВІКНА
export default function Modal({ isOpen, onClose, children }: ModalProps) {
  // ФІКСАЦІЯ МОНТУВАННЯ ТА КЕРУВАННЯ СЛУХАЧАМИ ПОДІЙ КЛАВІАТУРИ
  useEffect(() => {
    if (!isOpen) return;

    // ОБРОБНИК НАТИСКАННЯ КЛАВІШІ ESCAPE ДЛЯ ЗАКРИТТЯ ВІКНА
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    // ОЧИЩЕННЯ СЛУХАЧІВ ТА ВІДНОВЛЕННЯ СТАНУ ПРОКРУТКИ САЙТУ
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // ОБРОБНИК ЗАКРИТТЯ МОДАЛЬНОГО ВІКНА ПРИ КЛІКУ НА СІРИЙ ФОН (БЕКДРОП)
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // ЯКЩО ВІКНО ЗАКРИТЕ АБО КОД ВИКОНУЄТЬСЯ НА СЕРВЕРІ SSR - НІЧОГО НЕ РЕНДЕРИМО
  if (!isOpen || typeof window === "undefined" || !document.body) return null;

  // БЕЗПЕЧНИЙ РЕНДЕР ПОРТАЛУ БЕЗПОСЕРЕДНЬО В КОРІНЬ ДОКУМЕНТА BODY В БРАУЗЕРІ
  return createPortal(
    <div className={css.backdrop} role="dialog" aria-modal="true" onClick={handleBackdropClick}>
      <div className={css.modal}>{children}</div>
    </div>,
    document.body,
  );
}
