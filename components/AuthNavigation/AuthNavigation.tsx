"use client";

// Компонент навігації та керування сесією авторизації
// components/AuthNavigation/AuthNavigation.tsx

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store/authStore";
import { logout as logoutApi } from "@/lib/api/clientApi";
import css from "./AuthNavigation.module.css";

// КОНСТАНТИ МАРШРУТІВ АВТОРИЗАЦІЇ
// ------------------------------------------
export const AUTH_ROUTES = {
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  PROFILE: "/profile",
  HOME: "/",
};

// КЛІЄНТСЬКИЙ КОМПОНЕНТ: ДИНАМІЧНА НАВІГАЦІЯ АВТОРИЗАЦІЇ
// ------------------------------------------
export default function AuthNavigation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Отримання актуального стану та даних користувача зі сховища Zustand
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const clearIsAuthenticated = useAuthStore((state) => state.clearIsAuthenticated);

  // Налаштування мутації для безпечного виходу з системи на сервері та клієнті
  const { mutate: handleLogout, isPending } = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      // Очищення стану сховища Zustand
      clearIsAuthenticated();
      // Повністю скидаємо кеш React Query від старих запитів сесії
      queryClient.clear();
      // Перенаправляємо на публічну головну сторінку
      router.push(AUTH_ROUTES.HOME);
    },
  });

  return (
    <>
      {isAuthenticated && user ? (
        <>
          {/* Специфікація Сторінка 5: Посилання на профіль авторизованого користувача */}
          <li className={css.navigationItem}>
            <Link href={AUTH_ROUTES.PROFILE} className={css.navigationLink} prefetch={false}>
              Profile
            </Link>
          </li>

          {/* Специфікація Сторінка 5-6: Електронна пошта та кнопка виходу згорнуті в один li */}
          <li className={css.navigationItem}>
            <p className={css.userEmail}>{user.email}</p>
            <button
              type="button"
              className={css.logoutButton}
              onClick={() => handleLogout()}
              disabled={isPending}
            >
              {isPending ? "Leaving..." : "Logout"}
            </button>
          </li>
        </>
      ) : (
        <>
          {/* Специфікація Сторінка 6: Посилання Login для неавторизованого гостя */}
          <li className={css.navigationItem}>
            <Link href={AUTH_ROUTES.SIGN_IN} className={css.navigationLink} prefetch={false}>
              Login
            </Link>
          </li>

          {/* Специфікація Сторінка 6: Посилання Sign up для неавторизованого гостя */}
          <li className={css.navigationItem}>
            <Link href={AUTH_ROUTES.SIGN_UP} className={css.navigationLink} prefetch={false}>
              Sign up
            </Link>
          </li>
        </>
      )}
    </>
  );
}
