// ==========================================================
// Notes  (сторінка списку нотаток) - розмітка сторінки
// SSR (Server-Side Rendering)
// ==========================================================

import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api/clientApi";
import NotesClient from "./Notes.client";
import { Suspense } from "react";
import Loading from "@/app/loading";

const DEFAULT_PER_PAGE = 10;
const DEFAULT_TAG = "all";

interface PageProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ page?: string; search?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const currentTag = resolvedParams.slug?.[0] || DEFAULT_TAG;

  const formattedTag = currentTag.charAt(0).toUpperCase() + currentTag.slice(1);
  const pageTitle = `${formattedTag} Notes | NoteHub`;
  const pageDescription = `View and manage your filtered notes for category: ${currentTag}. Stay organized.`;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      // ГАРАНТОВАНО ВИПРАВЛЕНО: Знак долара $ та коса риска / на місці для правильної інтерполяції рядка!
      url: `https://notehub.com/${currentTag}`,
      images: [
        {
          url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
          width: 1200,
          height: 630,
          alt: `${formattedTag} notes filtering page on NoteHub`,
        },
      ],
    },
  };
}

export default async function NotesPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const currentTag = resolvedParams.slug?.[0] || DEFAULT_TAG;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const searchTerm = resolvedSearchParams.search || "";

  const queryClient = new QueryClient();
  const queryKey = ["notes", currentPage, searchTerm, currentTag];

  try {
    await queryClient.prefetchQuery({
      queryKey: queryKey,
      queryFn: () =>
        fetchNotes({
          page: currentPage,
          perPage: DEFAULT_PER_PAGE,
          search: searchTerm,
          tag: currentTag,
        }),
    });
  } catch (error) {
    console.error("Fetch notes failed on server:", error);
  }

  return (
    <Suspense fallback={<Loading />}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <NotesClient
          key={`${currentTag}`}
          initialPage={currentPage}
          initialSearch={searchTerm}
          tag={currentTag}
        />
      </HydrationBoundary>
    </Suspense>
  );
}
