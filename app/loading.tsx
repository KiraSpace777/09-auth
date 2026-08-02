// ==========================================================
// Глобальний Loader
// ==========================================================
// loading.tsx працює на базі React Suspense. Next.js автоматично огортає сторінку
// в <Suspense fallback={<Loading />}>. Цей механізм чудово працює на сервері (через
// стрімінг HTML), тому сам компонент лоадера спокійно може залишатися Server Component.
// ------------------------------------------------
// app/notes/loading.tsx

import css from "./loading.module.css";

const Loading = () => {
  return <p className={css.text}>Loading, please wait...</p>;
};
export default Loading;
