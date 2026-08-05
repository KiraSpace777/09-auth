// lib/api/api.ts
// ==============
// Налаштування базового екземпляра Axios для роботи через проксі-сервер

import axios from "axios";

// КОНСТАНТИ КОНФІГУРАЦІЇ ЗМІННИХ ОТОЧЕННЯ ТА БАЗОВОГО ШЛЯХУ ПРОКСІ
export const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ФОРМУВАННЯ БАЗОВОГО URL ДЛЯ ВСІХ КЛІЄНТСЬКИХ ЗАПИТІВ ДО ВНУТРІШНЬОГО ПРОКСІ
const baseURL = process.env.NEXT_PUBLIC_API_URL + "/api";

// СПІЛЬНИЙ ЕКЗЕМПЛЯР AXIOS З ОБОВ'ЯЗКОВИМ ПАРАМЕТРОМ ДЛЯ ПІДТРИМКИ СЕСІЙНИХ КУК
export const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});
