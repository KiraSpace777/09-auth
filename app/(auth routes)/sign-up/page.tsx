// app/(auth routes)/sign-up/page.tsx
// ==================================
// Сторінка реєстрації нових користувачів у системі

"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios, { AxiosError } from "axios";
import { register as registerApi } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import type { User } from "@/types/user";
import css from "./SignUpPage.module.css";

const MIN_PASSWORD_LENGTH = 3;
const REDIRECT_SUCCESS_PATH = "/profile";

const INITIAL_VALUES = {
  email: "",
  password: "",
};

const SignUpValidationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string()
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    .required("Password is required"),
});

interface ApiErrorResponse {
  message: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const { mutate, isPending, error } = useMutation<
    User,
    AxiosError<ApiErrorResponse>,
    typeof INITIAL_VALUES
  >({
    mutationFn: registerApi,
    onSuccess: (userData) => {
      setUser(userData);
      router.push(REDIRECT_SUCCESS_PATH);
    },
  });

  const handleFormSubmit = (values: typeof INITIAL_VALUES) => {
    mutate(values);
  };

  return (
    <main className={css.mainContent}>
      <Formik
        initialValues={INITIAL_VALUES}
        validationSchema={SignUpValidationSchema}
        onSubmit={handleFormSubmit}
      >
        {({ isSubmitting }) => (
          <Form className={css.form}>
            <h1 className={css.formTitle}>Sign up</h1>

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

            <div className={css.formGroup}>
              <label htmlFor="password">Password</label>
              <Field
                type="password"
                id="password"
                name="password"
                className={css.input}
                placeholder="Enter password"
              />
              <ErrorMessage name="password" component="div" className={css.error} />
            </div>

            <div className={css.actions}>
              <button
                type="submit"
                className={css.submitButton}
                disabled={isPending || isSubmitting}
              >
                {isPending ? "Registering..." : "Register"}
              </button>
            </div>

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
