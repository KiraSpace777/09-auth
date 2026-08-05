"use client";

// Сторінка реєстрації нових користувачів
// app/(auth routes)/sign-up/page.tsx

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import type { AxiosError } from "axios";
import { register as registerApi } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import type { User } from "@/types/user";
import css from "./SignUpPage.module.css";

// ТИПІЗАЦІЯ ДЛЯ СЕРВЕРНИХ ПОМИЛОК ВІДПОВІДІ
// ------------------------------------------
interface ApiErrorResponse {
  message: string;
}

// КОНСТАНТИ ТА СХЕМА ВАЛІДАЦІЇ ФОРМИ
// ------------------------------------------
const INITIAL_VALUES = {
  email: "",
  password: "",
};

const SignUpValidationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

// КЛІЄНТСЬКА СТОРІНКА: СТВОРЕННЯ ОБЛІКОВОГО ЗАПИСУ
// ------------------------------------------
export default function SignUpPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  // Ініціалізація мутації створення профілю з виключенням небезпечних типів
  const { mutate, isPending, error } = useMutation<
    User,
    AxiosError<ApiErrorResponse>,
    typeof INITIAL_VALUES
  >({
    mutationFn: registerApi,
    onSuccess: (userData) => {
      // Зберігаємо сесію створеного користувача у глобальному стані програми
      setUser(userData);
      // Автоматичний редірект на внутрішню сторінку після створення облікового запису
      router.push("/profile");
    },
  });

  const handleSubmit = (values: typeof INITIAL_VALUES) => {
    mutate(values);
  };

  return (
    <main className={css.mainContent}>
      <Formik
        initialValues={INITIAL_VALUES}
        validationSchema={SignUpValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className={css.form}>
            <h1 className={css.formTitle}>Sign up</h1>

            {/* Поле введення електронної пошти */}
            <div className={css.formGroup}>
              <label htmlFor="email">Email</label>
              <Field type="email" id="email" name="email" className={css.input} required />
              <ErrorMessage name="email" component="div" className={css.error} />
            </div>

            {/* Поле створення власного пароля */}
            <div className={css.formGroup}>
              <label htmlFor="password">Password</label>
              <Field type="password" id="password" name="password" className={css.input} required />
              <ErrorMessage name="password" component="div" className={css.error} />
            </div>

            {/* Блок керування формою */}
            <div className={css.actions}>
              <button
                type="submit"
                className={css.submitButton}
                disabled={isPending || isSubmitting}
              >
                {isPending ? "Registering..." : "Register"}
              </button>
            </div>

            {/* Обробка та виведення повідомлень про помилки реєстрації */}
            {error && axios.isAxiosError(error) && (
              <p className={css.error}>
                {error.response?.data?.message || "Registration failed. Try again."}
              </p>
            )}
          </Form>
        )}
      </Formik>
    </main>
  );
}

// =================================================
// "use client";
// export default function SignUpPage() {
//   return <main>Sign Up Page Coming Soon</main>;
// }
