"use client";

// Сторінка входу в систему
// app/(auth routes)/sign-in/page.tsx

import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import type { AxiosError } from "axios";
import { login as loginApi } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import type { User } from "@/types/user";
import css from "./SignInPage.module.css";

// ТИПІЗАЦІЯ ДЛЯ СЕРВЕРНИХ ПОМИЛОК
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

const SignInValidationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

// КЛІЄНТСЬКА СТОРІНКА: АВТОРИЗАЦІЯ КОРИСТУВАЧА
// ------------------------------------------
export default function SignInPage() {
  const router = useRouter();

  // Отримання актуального стану та методів сховища Zustand
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);

  // ЗАЛІЗНЕ ВИПРАВЛЕННЯ: Автоматичний редірект авторизованого користувача у профіль
  // Якщо глобальний AuthProvider підтвердив сесію при F5, миттєво перенаправляємо користувача
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/profile");
    }
  }, [isAuthenticated, router]);

  // Налаштування мутації для аутентифікації користувача з суворою типізацією відповіді
  const { mutate, isPending, error } = useMutation<
    User,
    AxiosError<ApiErrorResponse>,
    typeof INITIAL_VALUES
  >({
    mutationFn: loginApi,
    onSuccess: (userData) => {
      // Зберігаємо об'єкт аутентифікованого користувача в глобальний стор
      setUser(userData);
      // Перенаправляємо користувача в особистий кабінет після успішного входу
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
        validationSchema={SignInValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className={css.form}>
            <h1 className={css.formTitle}>Sign in</h1>

            {/* Поле введення електронної пошти */}
            <div className={css.formGroup}>
              <label htmlFor="email">Email</label>
              <Field type="email" id="email" name="email" className={css.input} required />
              <ErrorMessage name="email" component="div" className={css.error} />
            </div>

            {/* Поле введення пароля користувача */}
            <div className={css.formGroup}>
              <label htmlFor="password">Password</label>
              <Field type="password" id="password" name="password" className={css.input} required />
              <ErrorMessage name="password" component="div" className={css.error} />
            </div>

            {/* Блок надсилання форми */}
            <div className={css.actions}>
              <button
                type="submit"
                className={css.submitButton}
                disabled={isPending || isSubmitting}
              >
                {isPending ? "Logging in..." : "Log in"}
              </button>
            </div>

            {/* Відображення помилки від сервера у разі невдалого запиту */}
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

// ============================================
// "use client";

// // Сторінка входу в систему
// // app/(auth routes)/sign-in/page.tsx

// import { useMutation } from "@tanstack/react-query";
// import { useRouter } from "next/navigation";
// import { Formik, Form, Field, ErrorMessage } from "formik";
// import * as Yup from "yup";
// import axios from "axios";
// import type { AxiosError } from "axios";
// import { login as loginApi } from "@/lib/api/clientApi";
// import { useAuthStore } from "@/lib/store/authStore";
// import type { User } from "@/types/user";
// import css from "./SignInPage.module.css";

// // ТИПІЗАЦІЯ ДЛЯ СЕРВЕРНИХ ПОМИЛОК
// // ------------------------------------------
// interface ApiErrorResponse {
//   message: string;
// }

// // КОНСТАНТИ ТА СХЕМА ВАЛІДАЦІЇ ФОРМИ
// // ------------------------------------------
// const INITIAL_VALUES = {
//   email: "",
//   password: "",
// };

// const SignInValidationSchema = Yup.object().shape({
//   email: Yup.string().email("Invalid email address").required("Email is required"),
//   password: Yup.string().required("Password is required"),
// });

// // КЛІЄНТСЬКА СТОРІНКА: АВТОРИЗАЦІЯ КОРИСТУВАЧА
// // ------------------------------------------
// export default function SignInPage() {
//   const router = useRouter();
//   const setUser = useAuthStore((state) => state.setUser);

//   // Налаштування мутації для аутентифікації користувача з суворою типізацією відповіді
//   const { mutate, isPending, error } = useMutation<
//     User,
//     AxiosError<ApiErrorResponse>,
//     typeof INITIAL_VALUES
//   >({
//     mutationFn: loginApi,
//     onSuccess: (userData) => {
//       // Зберігаємо об'єкт аутентифікованого користувача в глобальний стор
//       setUser(userData);
//       // Перенаправляємо користувача в особистий кабінет після успішного входу
//       router.push("/profile");
//     },
//   });

//   const handleSubmit = (values: typeof INITIAL_VALUES) => {
//     mutate(values);
//   };

//   return (
//     <main className={css.mainContent}>
//       <Formik
//         initialValues={INITIAL_VALUES}
//         validationSchema={SignInValidationSchema}
//         onSubmit={handleSubmit}
//       >
//         {({ isSubmitting }) => (
//           <Form className={css.form}>
//             <h1 className={css.formTitle}>Sign in</h1>

//             {/* Поле введення електронної пошти */}
//             <div className={css.formGroup}>
//               <label htmlFor="email">Email</label>
//               <Field type="email" id="email" name="email" className={css.input} required />
//               <ErrorMessage name="email" component="div" className={css.error} />
//             </div>

//             {/* Поле введення пароля користувача */}
//             <div className={css.formGroup}>
//               <label htmlFor="password">Password</label>
//               <Field type="password" id="password" name="password" className={css.input} required />
//               <ErrorMessage name="password" component="div" className={css.error} />
//             </div>

//             {/* Блок надсилання форми */}
//             <div className={css.actions}>
//               <button
//                 type="submit"
//                 className={css.submitButton}
//                 disabled={isPending || isSubmitting}
//               >
//                 {isPending ? "Logging in..." : "Log in"}
//               </button>
//             </div>

//             {/* Відображення помилки від сервера у разі невдалого запиту */}
//             {error && axios.isAxiosError(error) && (
//               <p className={css.error}>
//                 {error.response?.data?.message || "Login failed. Please check your credentials."}
//               </p>
//             )}
//           </Form>
//         )}
//       </Formik>
//     </main>
//   );
// }
