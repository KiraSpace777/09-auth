// app/(private routes)/notes/[id]/page.tsx
// ========================================
// Серверна сторінка для повного перегляду детальної інформації про нотатку

import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { fetchNoteById } from "@/lib/api/serverApi";
import NoteDetailsClient from "./NoteDetails.client";
import { notFound } from "next/navigation";

// ТИПІЗАЦІЯ ДЛЯ ПАРАМЕТРІВ СЕРВЕРНОЇ СТОРІНКИ
interface PageProps {
  params: Promise<{ id: string }>;
}

// КОНСТАНТИ ДЛЯ ЗОВНІШНІХ МЕТАДАННИХ ТA КЕШУВАННЯ ЗАПИТІВ РЕАКТ КВЕРІ
const META_OG_URL_IMG = "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg";
const META_OG_IMG_W = 1200;
const META_OG_IMG_H = 630;
const NOTES_CACHE_KEY = "note";

// АСИНХРОННА ФУНКЦІЯ ДЛЯ ГЕНЕРАЦІЇ ДИНАМІЧНИХ МЕТАДАНИХ СТОРІНКИ НА СЕРВЕРІ
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;

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
        url: `https://notehub.com{id}`,
        images: [
          {
            url: META_OG_URL_IMG,
            width: META_OG_IMG_W,
            height: META_OG_IMG_H,
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

// ГОЛОВНИЙ СЕРВЕРНИЙ КОМПОНЕНТ ДЛЯ ДЕТАЛЬНОЇ СТОРІНКИ НОТАТКИ
export default async function NoteDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const queryClient = new QueryClient();

  try {
    // ПОПЕРЕДНЄ ЗАВАНТАЖЕННЯ ДАНИХ ЧЕРЕЗ БЕЗПЕЧНУ СЕРВЕРНУ ФУНКЦІЮ ІЗ СЕСІЄЮ
    await queryClient.prefetchQuery({
      queryKey: [NOTES_CACHE_KEY, id],
      queryFn: () => fetchNoteById(id),
    });
  } catch (error) {
    console.error("Fetch notes details failed on server:", error);
    notFound();
  }

  return (
    // ГІДРАТАЦІЯ ДАНИХ ДЛЯ КЛІЄНТСЬКОГО КОМПОНЕНТА БЕЗ ПОВТОРНОГО ЗАПИТУ В БРАУЗЕРІ
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NoteDetailsClient />
    </HydrationBoundary>
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
