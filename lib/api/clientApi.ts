// lib/api/clientApi.ts
// ====================
// Функції для виконання HTTP-запитів у клієнтських компонентах через проксі

import { api } from "./api";
import type { Note, CreateNoteData } from "@/types/note";
import type { AxiosResponse } from "axios";
import type { User } from "@/types/user";

// КОНСТАНТИ ЕНДПОЇНТІВ ДЛЯ ВНУТРІШНЬОГО ПРОКСІ-СЕРВЕРА NEXT.JS
export const NOTES_ENDPOINT = "/notes";
export const REGISTER_ENDPOINT = "/auth/register";
export const LOGIN_ENDPOINT = "/auth/login";
export const SESSION_ENDPOINT = "/auth/session";
export const LOGOUT_ENDPOINT = "/auth/logout";
export const USERS_ME_ENDPOINT = "/users/me";

// ТИПІЗАЦІЯ СТРУКТУРИ СПИСКУ НОТАТОК ДЛЯ ВІДПОВІДІ API
export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

// ТИПІЗАЦІЯ ПАРАМЕТРІВ ДЛЯ ФІЛЬТРАЦІЇ ТА ПАГІНАЦІЇ
export interface FetchNotesParams {
  page: number;
  perPage: number;
  search?: string;
  tag?: string;
}

// ОТРИМАННЯ СПИСКУ НОТАТОК З УРАХУВАННЯМ ПАРАМЕТРІВ ФІЛЬТРАЦІЇ ТА ПОШУКУ
export const fetchNotes = async ({
  page,
  perPage,
  search,
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> => {
  const queryTag = tag === "all" ? undefined : tag;

  // ПЕРЕДАЧА ПАРАМЕТРІВ НА ПРОКСІ-МАРШРУТ (БЕКЕНД ОЧІКУЄ ПАРАМЕТР TAG)
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

// ОТРИМАННЯ ОДНІЄЇ КОНКРЕТНОЇ НОТАТКИ ЗА ЇЇ УНІКАЛЬНИМ ID
export const fetchNoteById = async (id: string): Promise<Note> => {
  const response: AxiosResponse<Note> = await api.get<Note>(`${NOTES_ENDPOINT}/${id}`);
  return response.data;
};

// СТВОРЕННЯ НОВОЇ НОТАТКИ КОРИСТУВАЧЕМ ЧЕРЕЗ ВНУТРІШНІЙ ПРОКСІ
export const createNote = async (noteData: CreateNoteData): Promise<Note> => {
  const { data } = await api.post<Note>(NOTES_ENDPOINT, noteData);
  return data;
};

// ВИДАЛЕННЯ ІСНУЮЧОЇ НОТАТКИ ЗА ID КОРИСТУВАЧА
export const deleteNote = async (id: string): Promise<Note> => {
  const response: AxiosResponse<Note> = await api.delete<Note>(`${NOTES_ENDPOINT}/${id}`);
  return response.data;
};

// РЕЄСТРАЦІЯ НОВОГО ОБЛИКОВОГО ЗАПИСУ КОРИСТУВАЧА
export const register = async (userData: { email: string; username: string }): Promise<User> => {
  const { data } = await api.post<User>(REGISTER_ENDPOINT, userData);
  return data;
};

// АВТЕНТИФІКАЦІЯ ТA ВХІД КОРИСТУВАЧА В СИСТЕМУ
export const login = async (credentials: { email: string; username: string }): Promise<User> => {
  const { data } = await api.post<User>(LOGIN_ENDPOINT, credentials);
  return data;
};

// ПЕРЕВІРКА НАЯВНОСТІ АКТИВНОЇ СЕСІЇ ПРИ ПЕРЕЗАВАНТАЖЕННІ СТОРІНКИ
export const checkSession = async (): Promise<{ success: boolean } | null> => {
  try {
    const { data } = await api.get<{ success: boolean }>(SESSION_ENDPOINT);
    return data;
  } catch (error) {
    console.error("Session verification failed:", error);
    return { success: false };
  }
};

// ВИХІД ІЗ СИСТЕМИ ТА ОЧИЩЕННЯ HTTPONLY КУК НА ПРОКСІ-СЕРВЕРІ
export const logout = async (): Promise<void> => {
  await api.post(LOGOUT_ENDPOINT);
};

// ОТРИМАННЯ ДАНИХ ПОТОЧНОГО ПРОФІЛЮ АВТОРИЗОВАНОГО КОРИСТУВАЧА
export const getMe = async (): Promise<User> => {
  const { data } = await api.get<User>(USERS_ME_ENDPOINT);
  return data;
};

// ОНОВЛЕННЯ ТЕКСТОВИХ ДАНИХ (ІМЕНІ) ПОТОЧНОГО КОРИСТУВАЧА
export const updateMe = async (updatedData: { username: string }): Promise<User> => {
  const { data } = await api.patch<User>(USERS_ME_ENDPOINT, updatedData);
  return data;
};
