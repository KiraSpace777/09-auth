// -----------------------------------------------
//  сторінка реєстрації
// -----------------------------------------------
//  app/(private routes)/profile/page.tsx
// -----------------------------------------------
// app/(private routes)/profile/page.tsx
// =====================================
// Серверна сторінка детального профілю користувача (SSR)

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getMe } from "@/lib/api/serverApi"; // ВИКОРИСТАННЯ СЕРВЕРНОЇ ФУНКЦІЇ ДЛЯ ОТРИМАННЯ ДАНИХ
import css from "./ProfilePage.module.css";

const EDIT_PROFILE_ROUTE = "/profile/edit";
const AVATAR_SIZE = 120;

export const metadata: Metadata = {
  title: "My Profile | NoteHub",
  description: "View and manage your NoteHub personal profile information.",
};

export default async function ProfilePage() {
  // ПРЯМЕ СЕРВЕРНЕ ОТРИМАННЯ ДАНИХ КОРИСТУВАЧА НА ЕТАПІ РЕНДЕРИНГУ СТОРІНКИ
  const user = await getMe();

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <div className={css.header}>
          <h1 className={css.formTitle}>Profile Page</h1>
          <Link href={EDIT_PROFILE_ROUTE} className={css.editProfileButton}>
            Edit Profile
          </Link>
        </div>

        {user?.avatar && (
          <div className={css.avatarWrapper}>
            <Image
              src={user.avatar}
              alt="User Avatar"
              width={AVATAR_SIZE}
              height={AVATAR_SIZE}
              className={css.avatar}
              unoptimized
            />
          </div>
        )}

        <div className={css.profileInfo}>
          <p>
            <strong>Username:</strong> {user?.username}
          </p>
          <p>
            <strong>Email Address:</strong> {user?.email}
          </p>
        </div>
      </div>
    </main>
  );
}

// =======================================================
// export default function ProfilePage() {
//   return <main>User Profile Page Coming Soon</main>;
// }
