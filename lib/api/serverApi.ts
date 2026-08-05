// lib/api/serverApi.ts
// ====================
// Функції роботи з API виключно на серверній стороні (Server Components)

import axios from "axios";
import { cookies } from "next/headers";
import type { Note } from "@/types/note";
import type { User } from "@/types/user";

// КОНСТАНТА ПРЯМОГО ШЛЯХУ ДО РЕАЛЬНОГО БЕКЕНДУ З АВТОРИЗАЦІЄЮ
const SERVER_API_BASE_URL = "https://goit.study";

// ВНУТРІШНЯ ФУНКЦІЯ ДЛЯ СТВОРЕННЯ СЕРВЕРНОГО КЛІЄНТА З ПЕРЕДАЧЕЮ КУК
const getServerInstance = async () => {
  const cookieStore = await cookies();
  const allCookiesString = cookieStore.toString();

  return axios.create({
    baseURL: SERVER_API_BASE_URL,
    headers: {
      Cookie: allCookiesString, // ПЕРЕДАЧА СЕСІЙНИХ КУК У HEADERS ЗАПИТУ
    },
  });
};

// ОТРИМАННЯ СПИСКУ НОТАТОК НА СЕРВЕРІ СЕРВЕРНИМ КОМПОНЕНТОМ
export const fetchNotes = async (params: {
  page: number;
  perPage: number;
  search?: string;
  tag?: string;
}) => {
  const instance = await getServerInstance();
  const queryTag = params.tag === "all" ? undefined : params.tag;
  const { data } = await instance.get("/notes", {
    params: {
      page: params.page,
      perPage: params.perPage,
      search: params.search || undefined,
      tag: queryTag,
    },
  });
  return data;
};

// ОТРИМАННЯ ОДНІЄЇ НОТАТКИ ЗА ID ДЛЯ СЕРВЕРНОГО РЕНДЕРУ (SSR)
export const fetchNoteById = async (id: string): Promise<Note> => {
  const instance = await getServerInstance();
  const { data } = await instance.get<Note>(`/notes/${id}`);
  return data;
};

// ОТРИМАННЯ ДАНИХ ПОТОЧНОГО ПРОФІЛЮ АВТОРИЗОВАНОГО КОРИСТУВАЧА НА СЕРВЕРІ
export const getMe = async (): Promise<User> => {
  const instance = await getServerInstance();
  const { data } = await instance.get<User>("/users/me");
  return data;
};

// ПЕРЕВІРКА АКТИВНОЇ СЕСІЇ НА СЕРВЕРІ ДЛЯ ЗАХИСТУ МАРШРУТІВ
export const checkSession = async () => {
  const instance = await getServerInstance();
  const { data } = await instance.get("/auth/session");
  return data;
};
