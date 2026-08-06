// components/AuthNavigation/AuthNavigation.tsx
// ============================================
// Компонент навігації та керування сесією авторизації

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store/authStore";
import { logout as logoutApi } from "@/lib/api/clientApi";
import css from "./AuthNavigation.module.css";

const AUTH_ROUTES = {
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  PROFILE: "/profile",
  HOME: "/",
};

export default function AuthNavigation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const clearIsAuthenticated = useAuthStore((state) => state.clearIsAuthenticated);

  const { mutate: handleLogout, isPending } = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      clearIsAuthenticated();
      queryClient.clear();
      // ПЕРЕНАПРАВЛЕННЯ НА СТОРІНКУ ВХОДУ ПІСЛЯ ВИХОДУ З ОБЛІКОВОГО ЗАПИСУ
      router.push(AUTH_ROUTES.SIGN_IN);
    },
  });

  return (
    <>
      {isAuthenticated && user ? (
        <>
          <li className={css.navigationItem}>
            <Link href={AUTH_ROUTES.PROFILE} className={css.navigationLink} prefetch={false}>
              Profile
            </Link>
          </li>

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
          <li className={css.navigationItem}>
            <Link href={AUTH_ROUTES.SIGN_IN} className={css.navigationLink} prefetch={false}>
              Login
            </Link>
          </li>

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
