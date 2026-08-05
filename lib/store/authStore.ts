// lib/store/authStore.ts
// ==========================================
// Глобальне сховище стану авторизації Zustand

import { create } from "zustand";
import type { User } from "@/types/user";

// ПОЧАТКОВИЙ СТАН СХОВИЩА АВТОРИЗАЦІЇ (INITIAL STATE)
// ------------------------------------------
const initialAuthState = {
  user: null as User | null,
  isAuthenticated: false, // Залізно встановлюємо false, щоб неавторизовані гості бачили Login/Sign up
};

// ТИПІЗАЦІЯ СТАНУ ТА МЕТОДІВ ЗУСТАНД-СТОРУ
// ------------------------------------------
interface AuthStoreState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void; // Функція для встановлення даних користувача після успішного входу
  clearIsAuthenticated: () => void; // Функція для повного очищення стану авторизації
}

// ГЛОБАЛЬНИЙ ZUSTAND-СТОР ДЛЯ КЕРУВАННЯ АВТОРИЗАЦІЄЮ
// ------------------------------------------
export const useAuthStore = create<AuthStoreState>()((set) => ({
  ...initialAuthState,

  // Функція для оновлення полів авторизації після успішного запиту
  setUser: (user) =>
    set(() => ({
      user,
      isAuthenticated: true,
    })),

  // Функція для скидання стану до початкового гостьового вигляду
  clearIsAuthenticated: () =>
    set(() => ({
      user: null,
      isAuthenticated: false,
    })),
}));
