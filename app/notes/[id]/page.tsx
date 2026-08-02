// ============================================================================
// NoteDetails (серверний компонент)
// - Динамічні маршрути / Prefetch, кешування, dehydrate
// ============================================================================
// app/notes/[id]/page.tsx

import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { fetchNoteById } from "@/lib/api";
import NoteDetailsClient from "./NoteDetails.client";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

// // Асинхронна функція для генерації динамічних метаданих для сторінки нотатки
// //
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const note = await fetchNoteById(id);

    if (!note) {
      return { title: "Note Not Found | NoteHub" };
    }

    const pageTitle = `${note.title} | NoteHub`;
    const pageDescription = note.content
      ? note.content.substring(0, 150) + "..."
      : "No additional content provided for this note.";

    return {
      title: pageTitle,
      description: pageDescription,
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        // ВИПРАВЛЕНО: Додано пропущений сегмент /notes/ та символ $ для правильного формування динамічного URL та id нотатки
        url: `https://notehub.com/notes/${id}`,
        images: [
          {
            url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
            width: 1200,
            height: 630,
            alt: `Preview of note: ${note.title}`,
          },
        ],
      },
    };
  } catch (error) {
    console.error("Failed to generate metadata:", error);
    return { title: "Note Details | NoteHub" };
  }
}

export default async function NoteDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: ["note", id],
      queryFn: () => fetchNoteById(id),
    });
  } catch (error) {
    console.error("Fetch notes details failed:", error);
    notFound();
  }

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <NoteDetailsClient />
      </HydrationBoundary>
    </>
  );
}

//
// ============================================================================
// NoteDetails - Динамічні маршрути / Prefetch, кешування, dehydrate
// ============================================================================
// Структура:
//
// app/notes/[id]/page.tsx - залишаємо page.tsx серверним
// app/notes/[id]/NoteDetails.client.tsx - створюємо окремий клієнтський компонент для інтерактивного вмісту
//
// Для того, щоб використати ці дані в клієнтському компоненті, необхідно використати
// HydrationBoundary із React Query
// ---------------------------------------------
// До серверного компонента "app/notes/[id]/page.tsx" повертаємо логіку читання ідентифікатора
// із параметрів та додамо (prefetch), щоб компонент завантажував дані заздалегідь.
//
// /*** prefetchQuery - функція, яка завчасно завантажить нам ці нотатки та збереже їх у кеш на
// сервері. Завдяки цьому при виклику useQuery у клієнтському компоненті, дані вже будуть
// доступні - без повторного запиту.
// /*** queryKey - ключ, за яким дані будуть збережені у кеш
// /*** queryFn - функція HTTP-запиту
//
// Для того, щоб використати ці дані в клієнтському компоненті, необхідно використати
// HydrationBoundary із React Query:
// /*** HydrationBoundary - компонент, передає кеш клієнту
// /*** dehydrate(queryClient) - перетворює кеш у серіалізований об'єкт
