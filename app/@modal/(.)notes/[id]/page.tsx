// app/@modal/(.)notes/[id]/page.tsx
// ==========================================================
// Реалізація перехоплення маршруту: (.)notes/[id]
// Серверний компонент NotePreview з prefetch та гідратацією
// ==========================================================
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { fetchNoteById } from "@/lib/api";
import NotePreviewClient from "./NotePreview.client";

// Глобальні константи блоку
const NOTE_QUERY_KEY = "note";

interface InterceptedPageProps {
  params: Promise<{ id: string }>;
}

export default async function NotePreview({ params }: InterceptedPageProps) {
  // Асинхронно розгортаємо параметри шляху для отримання ID нотатки
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const queryClient = new QueryClient();

  // Попереднє завантаження деталей однієї конкретної нотатки на сервері для гідратації
  await queryClient.prefetchQuery({
    queryKey: [NOTE_QUERY_KEY, id],
    queryFn: () => fetchNoteById(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* Передаємо розгорнутий id у клієнтський компонент NotePreviewClient */}
      <NotePreviewClient noteId={id} />
    </HydrationBoundary>
  );
}
