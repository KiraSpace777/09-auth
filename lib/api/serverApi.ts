// lib/api/serverApi.ts
// ====================
// Функції роботи з API виключно на серверній стороні (Server Components)

import { cookies } from "next/headers";
import { api } from "./api";
import type { Note } from "@/types/note";
import type { User } from "@/types/user";

const SERVER_API_BASE_URL = "https://notehub-api.goit.study";

// ФУНКЦІЯ ДЛЯ ДИНАМІЧНОЇ КОНФІГУРАЦІЇ СПІЛЬНОГО ЕКЗЕМПЛЯРА ПЕРЕД ЗАПИТОМ
const prepareServerInstance = async () => {
  const cookieStore = await cookies();
  const allCookiesString = cookieStore.toString();

  // ВИКОРИСТАННЯ НАЯВНОГО ЕКЗЕМПЛЯРА AXIOS ЗАМІСТЬ СТВОРЕННЯ НОВОГО ЧЕРЕЗ AXIOS.CREATE
  api.defaults.baseURL = SERVER_API_BASE_URL;
  api.defaults.headers.Cookie = allCookiesString;

  return api;
};

export const fetchNotes = async (params: {
  page: number;
  perPage: number;
  search?: string;
  tag?: string;
}) => {
  const instance = await prepareServerInstance();
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

export const fetchNoteById = async (id: string): Promise<Note> => {
  const instance = await prepareServerInstance();
  const { data } = await instance.get<Note>(`/notes/${id}`);
  return data;
};

export const getMe = async (): Promise<User> => {
  const instance = await prepareServerInstance();
  const { data } = await instance.get<User>("/users/me");
  return data;
};

export const checkSession = async () => {
  const instance = await prepareServerInstance();
  const response = await instance.get("/auth/session");
  return response;
};
