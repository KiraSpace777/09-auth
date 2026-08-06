// app/(private routes)/@modal/(.)notes/[id]/page.tsx
// ==========================================================
// Реалізація перехоплення маршруту: (.)notes/[id]
// Серверний компонент NotePreview з prefetch та гідратацією
// Реалізація перехоплення маршруту для швидкого прев'ю нотатки в модальному вікні
// ==========================================================

import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { fetchNoteById } from "@/lib/api/serverApi"; // ІМПОРТ З SERVERAPI ЗГІДНО З СТРУКТУРОЮ РОБОТИ З API
import NotePreviewClient from "./NotePreview.client";

// КОНСТАНТИ ДЛЯ КЕШУВАННЯ ЗАПИТІВ ЗУСТАНД / РЕАКТ КВЕРІ
const NOTE_QUERY_KEY = "note";

// ТИПІЗАЦІЯ ПРОПСІВ ПЕРЕХОПЛЕНОГО МАРШРУТУ СТОРІНКИ ПРЕВ'Ю
interface InterceptedPageProps {
  params: Promise<{ id: string }>;
}

// СЕРВЕРНИЙ КОМПОНЕНТ ПРЕВ'Ю ДЛЯ ПЕРЕДАЧІ ДАНИХ У КЛІЄНТСЬКУ МОДАЛКУ
export default async function NotePreview({ params }: InterceptedPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const queryClient = new QueryClient();

  try {
    // ПОПЕРЕДНЄ ЗАВАНТАЖЕННЯ ДАНИХ ПРЕВ'Ю ЧЕРЕЗ СЕРВЕРНУ ФУНКЦІЮ ІЗ СЕСІЄЮ КОРИСТУВАЧА
    await queryClient.prefetchQuery({
      queryKey: [NOTE_QUERY_KEY, id],
      queryFn: () => fetchNoteById(id),
    });
  } catch (error) {
    console.error("Failed to prefetch note preview on server:", error);
  }

  return (
    // ПЕРЕДАЧА СЕРВЕРНОГО КЕШУ ДЛЯ МИТТЄВОГО ВІДОБРАЖЕННЯ В КЛІЄНТСЬКІЙ МОДАЛЦІ ПРЕВ'Ю
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotePreviewClient noteId={id} />
    </HydrationBoundary>
  );
}
