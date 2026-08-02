// =============================================================
/* api.ts - Глобальний експорт зовнішніх функцій та типів роботи з API */
// =============================================================
// lib/api.ts

import axios from "axios";
import type { AxiosResponse } from "axios";
import { Note, CreateNoteData } from "@/types/note";

// =========================================================
// Загальні константи блоку

const token = process.env.NEXT_PUBLIC_NOTEHUB_TOKEN;
const baseURL = "https://notehub-public.goit.study/api";

// =========================================================
// Інтерфейси для отримання списку нотаток та їх параметрів

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface FetchNotesParams {
  page: number;
  perPage: number;
  search?: string;
  tag?: string;
}

// =============================================
// Екземпляр клієнта Axios

export const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// =============================================
// Функція створення нової нотатки

export async function createNote(noteData: CreateNoteData): Promise<Note> {
  const { data } = await apiClient.post<Note>("/notes", noteData);
  return data;
}

// =============================================
// Функція видалення нотатки за її ID

export async function deleteNote(id: string): Promise<Note> {
  const response: AxiosResponse<Note> = await apiClient.delete<Note>(`/notes/${id}`);
  return response.data;
}

// =============================================
// Функція отримання списку нотаток

export async function fetchNotes({
  page,
  perPage,
  search,
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> {
  // Паралельні маршрути для фільтрації нотаток за тегом. Перевіряємо значення тегу: якщо користувач обрав 'all',
  // сервер не очікує цей тег, тому ми передаємо undefined, щоб повністю виключити його з параметрів запиту.
  const queryTag = tag === "all" ? undefined : tag;

  const response: AxiosResponse<FetchNotesResponse> = await apiClient.get<FetchNotesResponse>(
    "/notes",
    {
      /* Передаємо чисті параметри, які прийшли з Notes.client.tsx та page.tsx */
      params: {
        page,
        perPage,
        search: search || undefined,
        tag: queryTag,
      },
    },
  );

  return response.data;
}

// =============================================
// Функція отримання детальної інформації про нотатку за її ID
export async function fetchNoteById(id: string): Promise<Note> {
  const { data } = await apiClient.get<Note>(`/notes/${id}`);
  return data;
}
