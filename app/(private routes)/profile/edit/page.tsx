// app/(private routes)/profile/edit/page.tsx
// ==========================================
// Сторінка редагування профілю користувача

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Image from "next/image"; // ІМПОРТ ОПТИМІЗОВАНОГО КОМПОНЕНТА ДЛЯ ЗОБРАЖЕНЬ NEXT.JS
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios, { AxiosError } from "axios";
import { updateMe } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import { User } from "@/types/user";
import css from "./EditProfilePage.module.css";

// КОНСТАНТИ ДЛЯ НАЛАШТУВАННЯ ВАЛІДАЦІЇ ТА КЕШУВАННЯ ЗAПИТІВ
const MIN_USERNAME_LENGTH = 3;
const USER_PROFILE_QUERY_KEY = "user-profile";
const AVATAR_SIZE = 120; // СТАНДАРТНИЙ РОЗМІР ДЛЯ СТОРОНЬОГО АВАТАРА КОРИСТУВАЧА

// ПОЧАТКОВИЙ СТАН ПОЛІВ ФОРМИ ЗА ЗАМОВЧУВАННЯМ
const INITIAL_VALUES = {
  username: "",
};

// СХЕМА ВАЛІДАЦІЇ ДЛЯ ПЕРЕВІРКИ ВВЕДЕНОГО ІМЕНІ КОРИСТУВАЧА
const EditProfileValidationSchema = Yup.object().shape({
  username: Yup.string()
    .min(MIN_USERNAME_LENGTH, `Username must be at least ${MIN_USERNAME_LENGTH} characters`)
    .required("Username is required"),
});

// ТИПІЗАЦІЯ ДЛЯ СЕРВЕРНИХ ПОМИЛОК ТА СТРУКТУРИ ВІДПОВІДІ
interface ApiErrorResponse {
  message: string;
}

// КЛІЄНТСЬКА СТОРІНКА ДЛЯ ОНОВЛЕННЯ ДАНИХ ПРОФІЛЮ
export default function EditProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ОТРИМАННЯ ДАНИХ ТА МЕТОДУ ОНОВЛЕННЯ З ГЛОБАЛЬНОГО СХОВИЩА ЗУСТАНД
  const { user, setUser } = useAuthStore();

  // ЗАПОВНЕННЯ ПОЧАТКОВОГО СТАНУ ФОРМИ АКТУАЛЬНИМ ІМЕНЕМ КОРИСТУВАЧА
  const formInitialValues = {
    username: user?.username || INITIAL_VALUES.username,
  };

  // МУТАЦІЯ ДЛЯ ВІДПРАВКИ PATCH-ЗAПИТУ НА ЗМІНУ ДАНИХ КОРИСТУВАЧА
  const { mutate, isPending, error } = useMutation<
    User,
    AxiosError<ApiErrorResponse>,
    typeof INITIAL_VALUES
  >({
    mutationFn: updateMe,
    onSuccess: (updatedUser) => {
      // ОНОВЛЕННЯ ДАНИХ КОРИСТУВАЧА В ГЛОБАЛЬНОМУ ЗУСТАНД-СТОРІ
      setUser(updatedUser);

      // ОЧИЩЕННЯ КЕШУ ДЛЯ ПЕРЕЗАВАНТАЖЕННЯ АКТУАЛЬНИХ ДАНИХ СЕСІЇ
      queryClient.invalidateQueries({ queryKey: [USER_PROFILE_QUERY_KEY] });

      // АВТОМАТИЧНИЙ ПЕРЕХІД НА ГОЛОВНУ СТОРІНКУ ПРОФІЛЮ
      router.push("/profile");
    },
  });

  // ОБРОБНИК ВІДПРАВКИ ФОРМИ ТА ЗАПУСК МУТАЦІЇ З НОВИМИ ЗНАЧЕННЯМИ
  const handleFormSubmit = (values: typeof INITIAL_VALUES) => {
    mutate(values);
  };

  return (
    <main className={css.mainContent}>
      {/* КАРТКА-ОБГОРТКА ДЛЯ ФОРМИ РЕДАГУВАННЯ ЗА СТИЛЯМИ ПРОЕКТУ */}
      <div className={css.profileCard}>
        <h1 className={css.formTitle}>Edit Profile</h1>

        {/* ОНОВЛЕНО: ВИКОРИСТАННЯ ОПТИМІЗОВАНОГО КОМПОНЕНТА IMAGE ЗАМІСТЬ IMG */}
        {user?.avatar && (
          <div className={css.avatarWrapper}>
            <Image
              src={user.avatar}
              alt="User Avatar"
              width={AVATAR_SIZE}
              height={AVATAR_SIZE}
              className={css.avatar}
              priority // ПРІОРИТЕТНЕ ЗАВАНТАЖЕННЯ ДЛЯ КОРЕКТНОГО ПОКАЗНИКА LCP
            />
          </div>
        )}

        <Formik
          initialValues={formInitialValues}
          validationSchema={EditProfileValidationSchema}
          enableReinitialize={true} // ОНОВЛЕННЯ ПОЛІВ ФОРМИ ПРИ ЗМІНІ ДАНИХ У СТОРІ
          onSubmit={handleFormSubmit}
        >
          {({ isSubmitting }) => (
            <Form className={css.form}>
              <div className={css.profileInfo}>
                {/* ПОЛЕ ВВЕДЕННЯ НОВОГО ІМЕНІ З ВАЛІДАЦІЄЮ ТА ОБРОБКОЮ ПОМИЛОК */}
                <div className={css.usernameWrapper}>
                  <label htmlFor="username">Username:</label>
                  <Field
                    type="text"
                    id="username"
                    name="username"
                    className={css.input}
                    placeholder="Enter your name"
                  />
                  <ErrorMessage name="username" component="div" className={css.error} />
                </div>

                {/* СТАТИЧНЕ ВІДОБРАЖЕННЯ ПОШТОВОЇ СКРИНЬКИ КОРИСТУВАЧА */}
                <p>Email: {user?.email || "user_email@example.com"}</p>
              </div>

              {/* БЕЗПЕЧНЕ ВИВЕДЕННЯ СЕРВЕРНОЇ ПОМИЛКИ ВІД API AXIOS */}
              {error && axios.isAxiosError(error) && (
                <div style={{ color: "#dc3545", fontSize: "0.9rem", marginBottom: "1rem" }}>
                  {error.response?.data?.message || "Failed to update profile. Try again."}
                </div>
              )}

              {/* КНОПКИ КЕРУВАННЯ ТА СКАСУВАННЯ ЗМІН У ФОРМІ */}
              <div className={css.actions}>
                <button
                  type="button"
                  className={css.cancelButton}
                  onClick={() => router.push("/profile")}
                  disabled={isPending}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={css.saveButton}
                  disabled={isPending || isSubmitting}
                >
                  {isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </main>
  );
}
