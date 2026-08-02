// ==========================================================
// Завантаження даних у клієнтському компоненті,
// підключення провайдера React Query
// ==========================================================
// components/TanStackProvider/TanStackProvider.tsx

"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type Props = {
  children: React.ReactNode;
};

const TanStackProvider = ({ children }: Props) => {
  const [queryClient] = useState(() => new QueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default TanStackProvider;

// ==========================================================
// Порядок підключення провайдера React Query
// ==========================================================
// 1) робота з клієнтськими компонентами :
// app / notes / [id] / NoteDetails.client.tsx;
// ----------------------------------------------------------
// 2) створення провайдера React Query:
// components/TanStackProvider/TanStackProvider.tsx;;;;
// QueryClient – керує кешем, мутаціями, завантаженнями тощо
// QueryClientProvider – обгортка яка дає доступ до queryClient усім дочірнім компонентам
// ----------------------------------------------------------
// 3) підключення провайдера (раз на весь проект) в головному шаблоні app/layout.tsx який огортає всі компоненти додатка.
// ==========================================================
//
