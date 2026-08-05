// -----------------------------------------------
//  сторінка реєстрації
// -----------------------------------------------
//  app/(private routes)/profile/page.tsx
// -----------------------------------------------

"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { AxiosError } from "axios";
import { getMe } from "@/lib/api/clientApi";
import type { User } from "@/types/user";
import css from "./ProfilePage.module.css";

// =========================================================================
// КОНСТАНТИ КОНФІГУРАЦІЇ ЗОБРАЖЕНЬ ТА РОУТІВ
// =========================================================================
export const EDIT_PROFILE_ROUTE = "/profile/edit";
export const AVATAR_SIZE = 150; // Фіксована базова ширина та висота аватара в пікселях

interface ApiErrorResponse {
  message: string;
}

// =========================================================================
// КЛІЄНТЬКА СТОРІНКА: ДЕТАЛЬНИЙ ПРОФІЛЬ КОРИСТУВАЧА
// =========================================================================
export default function ProfilePage() {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User, AxiosError<ApiErrorResponse>>({
    queryKey: ["user-profile"],
    queryFn: getMe,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className={css.mainContent}>
        <p style={{ color: "#333" }}>Loading profile details...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={css.mainContent}>
        <div className={css.error}>
          {error && axios.isAxiosError(error)
            ? error.response?.data?.message
            : "Failed to load profile."}
        </div>
      </div>
    );
  }

  return (
    <main className={css.mainContent}>
      {/* Картка профілю користувача суворо за класами вашого CSS */}
      <div className={css.profileCard}>
        {/* Шапка картки з назвою та кнопкою переходу до редагування */}
        <div className={css.header}>
          <h1 className={css.formTitle}>My Profile</h1>
          <Link href={EDIT_PROFILE_ROUTE} className={css.editProfileButton}>
            Edit Profile
          </Link>
        </div>

        {/* Блок відображення оптимізованого аватара без використання тегу img */}
        {user.avatar && (
          <div className={css.avatarWrapper}>
            <Image
              src={user.avatar}
              alt={`${user.username}'s avatar`}
              width={AVATAR_SIZE}
              height={AVATAR_SIZE}
              className={css.avatar}
              unoptimized={true} // Дозволяє завантажувати зовнішні посилання GoIT без помилок доменів
            />
          </div>
        )}

        {/* Секція відображення текстових полів профілю користувача */}
        <div className={css.profileInfo}>
          <div className={css.usernameWrapper}>
            <span>
              <strong>Username:</strong>
            </span>
            <span>{user.username}</span>
          </div>

          <div className={css.usernameWrapper}>
            <span>
              <strong>Email Address:</strong>
            </span>
            <span>{user.email}</span>
          </div>
        </div>
      </div>
    </main>
  );
}

// =======================================================
// export default function ProfilePage() {
//   return <main>User Profile Page Coming Soon</main>;
// }
