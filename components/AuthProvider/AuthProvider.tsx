"use client";

// Провайдер ініціалізації сесії користувача
// components/AuthProvider/AuthProvider.tsx

import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { checkSession, getMe } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import type { AxiosError } from "axios";
import type { User } from "@/types/user";

// ТИПІЗАЦІЯ ДЛЯ СЕРВЕРНИХ ПОМИЛОК ВІДПОВІДІ
// ------------------------------------------
interface ApiErrorResponse {
  message: string;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

// КЛІЄНТСЬКИЙ КОМПОНЕНТ: АВТО-ІНІЦІАЛІЗАЦІЯ СЕСІЇ ПРИ ЗАВАНТАЖЕННІ
// ------------------------------------------
export default function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();

  // Отримуємо актуальні методи керування глобальним станом авторизації
  const setUser = useAuthStore((state) => state.setUser);
  const clearIsAuthenticated = useAuthStore((state) => state.clearIsAuthenticated);

  // Використовуємо автоматичний фоновий запит до готового менторського API сесії
  const { data, error, isPending } = useQuery<
    { success: boolean } | null,
    AxiosError<ApiErrorResponse>
  >({
    queryKey: ["auth-session"],
    queryFn: checkSession,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Ефект синхронізації відповіді менторського сервера з глобальним сховищем стану
  useEffect(() => {
    const initializeUser = async () => {
      // Перевіряємо формат відповіді від готового API ментора
      if (data && data.success === true) {
        try {
          // Якщо сесія активна, викликаємо метод отримання даних профілю користувача
          const profileData = await queryClient.fetchQuery<User>({
            queryKey: ["user-me"],
            queryFn: getMe,
          });

          if (profileData) {
            setUser(profileData);
          }
        } catch (profileError) {
          console.error("Failed to fetch user profile:", profileError);
          clearIsAuthenticated();
        }
      } else if (data && data.success === false) {
        // Якщо менторський сервер повернув success: false — очищаємо стан авторизації
        clearIsAuthenticated();
      }
    };

    initializeUser();
  }, [data, error, setUser, clearIsAuthenticated, queryClient]);

  // Запобігаємо миготінню елементів інтерфейсу під час первинної перевірки кук
  if (isPending) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "white",
          background: "#212529",
        }}
      >
        <p>Initializing Session, please wait...</p>
      </div>
    );
  }

  return <>{children}</>;
}
