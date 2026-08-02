import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CreateNoteData } from "@/types/note";

// Типізуємо наш Zustand-стор відповідно до вимог ТЗ
interface NoteStoreState {
  draft: CreateNoteData;
  setDraft: (note: Partial<CreateNoteData>) => void;
  clearDraft: () => void;
}

// Початковий стан створення нотатки
const initialDraft: CreateNoteData = {
  title: "",
  content: "",
  tag: "Todo",
};

/**
 * Zustand-стор для збереження чернетки.
 * Використовує подвійні дужки create<...>()(...) для коректного визначення типів у TS.
 */
export const useNoteStore = create<NoteStoreState>()(
  persist(
    (set) => ({
      draft: initialDraft,

      // Функція для оновлення полів чернетки з обов'язковим збереженням інших полів draft
      setDraft: (note) =>
        set((state) => ({
          draft: {
            ...state.draft,
            ...note, // Накладаємо оновлені поля поверх попереднього стану
          },
        })),

      // Функція для очищення чернетки до початкового стану
      clearDraft: () => set({ draft: initialDraft }),
    }),
    {
      name: "notehub-draft-storage", // Ключ для localStorage

      // зберігаємо в localStorage лише об'єкт draft, без методів
      partialize: (state) => ({ draft: state.draft }),
    },
  ),
);
