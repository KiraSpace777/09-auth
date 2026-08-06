// lib/api/clientApi.ts
// ====================
// Конфігурація та функції клієнтських запитів до API через проксі-сервер

import { api } from "./api";
import type { Note, CreateNoteData } from "@/types/note";
import type { AxiosResponse } from "axios";
import type { User } from "@/types/user";

// КОНСТАНТИ МАРШРУТІВ КЛІЄНТСЬКОГО API ДЛЯ ВНУТРІШНЬОГО ПРОКСІ
export const NOTES_ENDPOINT = "/notes";
export const REGISTER_ENDPOINT = "/auth/register";
export const LOGIN_ENDPOINT = "/auth/login";
export const SESSION_ENDPOINT = "/auth/session";
export const LOGOUT_ENDPOINT = "/auth/logout";
export const USERS_ME_ENDPOINT = "/users/me";

// ТИПІЗАЦІЯ ДЛЯ СТРУКТУРИ ВІДПОВІДІ СПИСКУ НОТАТОК
export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

// ТИПІЗАЦІЯ ПАРАМЕТРІВ ЗАПИТУ НОТАТОК ДЛЯ ПАГІНАЦІЇ
export interface FetchNotesParams {
  page: number;
  perPage: number;
  search?: string;
  tag?: string;
}

// ОТРИМАННЯ СПИСКУ НОТАТОК ІЗ ФІЛЬТРАЦІЄЮ ТА ПАГІНАЦІЄЮ
export const fetchNotes = async ({
  page,
  perPage,
  search,
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> => {
  const queryTag = tag === "all" ? undefined : tag;
  const response: AxiosResponse<FetchNotesResponse> = await api.get<FetchNotesResponse>(
    NOTES_ENDPOINT,
    {
      params: {
        page,
        perPage,
        search: search || undefined,
        tag: queryTag,
      },
    },
  );
  return response.data;
};

// ОТРИМАННЯ КОНКРЕТНОЇ НОТАТКИ ЗА ЇЇ ID НА КЛІЄНТІ
export const fetchNoteById = async (id: string): Promise<Note> => {
  const response: AxiosResponse<Note> = await api.get<Note>(`${NOTES_ENDPOINT}/${id}`);
  return response.data;
};

// СТВОРЕННЯ НОВОЇ НОТАТКИ ЧЕРЕЗ КЛІЄНТСЬКУ ФОРМУ
export const createNote = async (noteData: CreateNoteData): Promise<Note> => {
  const { data } = await api.post<Note>(NOTES_ENDPOINT, noteData);
  return data;
};

// ВИДАЛЕННЯ НОТАТКИ ЗА ЇЇ ID
export const deleteNote = async (id: string): Promise<Note> => {
  const response: AxiosResponse<Note> = await api.delete<Note>(`${NOTES_ENDPOINT}/${id}`);
  return response.data;
};

// ОНОВЛЕНО: ТИПІЗАЦІЯ ДЛЯ РЕЄСТРАЦІЇ СУВОРO ОЧІКУЄ ПАРАМЕТРИ EMAIL ТA PASSWORD ДЛЯ ФОРМИ
export const register = async (userData: { email: string; password: string }): Promise<User> => {
  const { data } = await api.post<User>(REGISTER_ENDPOINT, userData);
  return data;
};

// ОНОВЛЕНО: ТИПІЗАЦІЯ ДЛЯ ВХОДУ СУВОРO ОЧІКУЄ ПАРАМЕТРИ EMAIL ТA PASSWORD ДЛЯ ФОРМИ
export const login = async (credentials: { email: string; password: string }): Promise<User> => {
  const { data } = await api.post<User>(LOGIN_ENDPOINT, credentials);
  return data;
};

// АВТОМАТИЧНА ПЕРЕВІРКА АКТИВНОЇ СЕСІЇ ПРИ ЗАВАНТАЖЕННІ САЙТУ
export const checkSession = async (): Promise<{ success: boolean } | null> => {
  try {
    const { data } = await api.get<{ success: boolean }>(SESSION_ENDPOINT);
    return data;
  } catch (error) {
    console.error("Session verification failed:", error);
    return { success: false };
  }
};

// СТИРАННЯ СЕСІЙНИХ КУК НА ПРОКСІ-СЕРВЕРІ
export const logout = async (): Promise<void> => {
  await api.post(LOGOUT_ENDPOINT);
};

// ОТРИМАННЯ ДАНИХ ПОТОЧНОГО ПРОФІЛЮ КОРИСТУВАЧА
export const getMe = async (): Promise<User> => {
  const { data } = await api.get<User>(USERS_ME_ENDPOINT);
  return data;
};

// ОНОВЛЕННЯ ТЕКСТОВИХ ДАНИХ ПРОФІЛЮ КОРИСТУВАЧА
export const updateMe = async (updatedData: { username: string }): Promise<User> => {
  const { data } = await api.patch<User>(USERS_ME_ENDPOINT, updatedData);
  return data;
};
