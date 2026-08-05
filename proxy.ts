// proxy.ts
// ========
// Проміжне програмне забезпечення для контролю доступу до приватних зон програми

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// КОНСТАНТИ ДЛЯ ШЛЯХІВ ПЕРЕНАПРАВЛЕННЯ ТА СЕСІЙНОЇ КУКИ БЕКЕНДУ
const SIGN_IN_PATH = "/sign-in";
const PROFILE_PATH = "/profile";
const AUTH_TOKEN_KEY = "accessToken"; // СУВОРЕ ПОВЕРНЕННЯ ОРИГІНАЛЬНОЇ НАЗВИ КУКИ

// МАСИВИ МАРШРУТІВ ДЛЯ ПЕРЕВІРКИ ПРАВ ДОСТУПУ КОРИСТУВАЧА
const PRIVATE_ROUTES = ["/profile", "/notes"];
const PUBLIC_ROUTES = ["/sign-in", "/sign-up"];

// НАЛАШТУВАННЯ МАТЧЕРА ДЛЯ ВИЗНАЧЕННЯ ЗОН ФІЛЬТРАЦІЇ ПЕРЕХОПЛЕННЯ
export const config = {
  matcher: ["/notes/:path*", "/profile/:path*", "/sign-in", "/sign-up"],
};

// ГОЛОВНА ФУНКЦІЯ ПЕРЕХОПЛЕННЯ ЗАПИТІВ НА РІВНІ ПРОКСІ-СЕРВЕРА
export default function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get(AUTH_TOKEN_KEY);
  const { pathname } = request.nextUrl;

  // ДІАГНОСТИЧНИЙ ЛОГ СТАТУСУ ПЕРЕХІДНОГО МАРШРУТУ В КОНСОЛІ ТЕРМІНАЛУ
  console.log(`[Proxy Guard]: Route -> ${pathname} | Token Active -> ${!!sessionToken}`);

  // ПЕРЕВІРКА ДОСТУПУ НЕАВТОРИЗОВАНИХ КОРИСТУВАЧІВ ДО ПРИВАТНИХ СТОРІНОК
  const isPrivate = PRIVATE_ROUTES.some((route) => pathname.startsWith(route));
  if (isPrivate && !sessionToken) {
    const loginUrl = new URL(SIGN_IN_PATH, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // ПЕРЕВІРКА ДОСТУПУ АВТОРИЗОВАНИХ КОРИСТУВАЧІВ ДО ПУБЛІЧНИХ СТОРІНОК ВХОДУ
  const isPublic = PUBLIC_ROUTES.some((route) => pathname === route);
  if (isPublic && sessionToken) {
    const profileUrl = new URL(PROFILE_PATH, request.url);
    return NextResponse.redirect(profileUrl);
  }

  return NextResponse.next();
}
