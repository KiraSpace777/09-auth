// app/(auth routes)/sign-in/page.tsx
// ===================================
// Сторінка входу в систему користувача

"use client";

import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios, { AxiosError } from "axios";
import { login as loginApi } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import type { User } from "@/types/user";
import css from "./SignInPage.module.css";

// КОНСТАНТИ ДЛЯ НАЛАШТУВАННЯ ВАЛІДАЦІЇ ТА КЕШУВАННЯ МАРШРУТІВ
const MIN_USERNAME_LENGTH = 3;
const REDIRECT_SUCCESS_PATH = "/profile";

// ПОЧАТКОВИЙ СТАН ПОЛІВ ФОРМИ ЗГІДНО З НОВИМИ ПАРАМЕТРАМИ АПІ
const INITIAL_VALUES = {
  email: "",
  username: "",
};

// СХЕМА ВАЛІДАЦІЇ ДЛЯ ПЕРЕВІРКИ ЕЛЕКТРОННОЇ ПОШТИ ТА ІМЕНІ КОРИСТУВАЧА
const SignInValidationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  username: Yup.string()
    .min(MIN_USERNAME_LENGTH, `Username must be at least ${MIN_USERNAME_LENGTH} characters`)
    .required("Username is required"),
});

// ТИПІЗАЦІЯ ДЛЯ СЕРВЕРНИХ ПОМИЛОК ВІДПОВІДІ
interface ApiErrorResponse {
  message: string;
}

// КЛІЄНТСЬКА СТОРІНКА ДЛЯ АВТЕНТИФІКАЦІЇ КОРИСТУВАЧА
export default function SignInPage() {
  const router = useRouter();

  // ОТРИМАННЯ АКТУАЛЬНОГО СТАНУ ТА МЕТОДІВ З ГЛОБАЛЬНОГО СХОВИЩА ЗУСТАНД
  const { isAuthenticated, setUser } = useAuthStore();

  // АВТОМАТИЧНИЙ ПЕРЕНАПРАВЛЕННЯ ВЖЕ АВТОРИЗОВАНОГО КОРИСТУВАЧА В ПРОФІЛЬ
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(REDIRECT_SUCCESS_PATH);
    }
  }, [isAuthenticated, router]);

  // НАЛАШТУВАННЯ МУТАЦІЇ ДЛЯ АВТЕНТИФІКАЦІЇ З СУВОРОЮ ТИПІЗАЦІЄЮ
  const { mutate, isPending, error } = useMutation<
    User,
    AxiosError<ApiErrorResponse>,
    typeof INITIAL_VALUES
  >({
    mutationFn: loginApi,
    onSuccess: (userData) => {
      // ЗБЕРЕЖЕННЯ ОБ'ЄКТА АВТОРИЗОВАНОГО КОРИСТУВАЧА В ГЛОБАЛЬНИЙ СТОР
      setUser(userData);

      // ПЕРЕХІД ДО ОСОБИСТОГО КАБІНЕТУ ПІСЛЯ УСПІШНОГО ВХОДУ
      router.push(REDIRECT_SUCCESS_PATH);
    },
  });

  // ОБРОБНИК ВІДПРАВКИ ДАНИХ ФОРМИ АВТЕНТИФІКАЦІЇ
  const handleFormSubmit = (values: typeof INITIAL_VALUES) => {
    mutate(values);
  };

  return (
    <main className={css.mainContent}>
      <Formik
        initialValues={INITIAL_VALUES}
        validationSchema={SignInValidationSchema}
        onSubmit={handleFormSubmit}
      >
        {({ isSubmitting }) => (
          <Form className={css.form}>
            <h1 className={css.formTitle}>Sign in</h1>

            {/* ПОЛЕ ВВЕДЕННЯ ЕЛЕКТРОННОЇ ПОШТИ КОРИСТУВАЧА */}
            <div className={css.formGroup}>
              <label htmlFor="email">Email</label>
              <Field
                type="email"
                id="email"
                name="email"
                className={css.input}
                placeholder="Enter email"
              />
              <ErrorMessage name="email" component="div" className={css.error} />
            </div>

            {/* ПОЛЕ ВВЕДЕННЯ ІМЕНІ КОРИСТУВАЧА ЗАМІСТЬ СТAРОГО ПAРОЛЯ */}
            <div className={css.formGroup}>
              <label htmlFor="username">Username</label>
              <Field
                type="text"
                id="username"
                name="username"
                className={css.input}
                placeholder="Enter username"
              />
              <ErrorMessage name="username" component="div" className={css.error} />
            </div>

            {/* БЛОК КНОПКИ ВІДПРАВКИ ДАНИХ АВТЕНТИФІКАЦІЇ */}
            <div className={css.actions}>
              <button
                type="submit"
                className={css.submitButton}
                disabled={isPending || isSubmitting}
              >
                {isPending ? "Logging in..." : "Log in"}
              </button>
            </div>

            {/* ВІДОБРАЖЕННЯ ПОМИЛКИ ВІД СЕРВЕРА ПРИ НЕВДАЛОМУ ЗАПИТІ */}
            {error && axios.isAxiosError(error) && (
              <p className={css.error}>
                {error.response?.data?.message || "Login failed. Please check your credentials."}
              </p>
            )}
          </Form>
        )}
      </Formik>
    </main>
  );
}
