// proxy.ts
// ========
// Проміжне програмне забезпечення для контролю доступу до приватних зон програми

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { checkSession } from "./lib/api/serverApi";

const SIGN_IN_PATH = "/sign-in";
const AUTH_TOKEN_KEY = "accessToken";
const PRIVATE_ROUTES = ["/profile", "/notes"];
const PUBLIC_ROUTES = ["/sign-in", "/sign-up", "/"];

export const config = {
  matcher: ["/notes/:path*", "/profile/:path*", "/sign-in", "/sign-up"],
};

export default async function proxy(request: NextRequest) {
  // АСИНХРОННЕ ОТРИМАННЯ КУКІВ ЗГІДНО З РЕКОМЕНДАЦІЯМИ NEXT.JS PROXY API
  const cookieStore = await cookies();
  let sessionToken = cookieStore.get(AUTH_TOKEN_KEY)?.value;
  const { pathname } = request.nextUrl;

  console.log(`[Proxy Guard]: Route -> ${pathname} | Token Active -> ${!!sessionToken}`);

  let responseWithNewCookies: NextResponse | null = null;

  // ЛОГІКА ОНОВЛЕННЯ СЕСІЇ ЧЕРЕЗ checkSession
  // Якщо токен відсутній у куках, виконуємо перевірку/відновлення сесії через API
  if (!sessionToken) {
    try {
      const response = await checkSession();

      // Якщо сервер успішно відповів (200 OK) і надіслав нові куки через заголовки
      if (response && response.status === 200) {
        // Оновлюємо значення токена, щоб пропустити користувача далі на приватний маршрут
        const freshCookieStore = await cookies();
        sessionToken = freshCookieStore.get(AUTH_TOKEN_KEY)?.value;

        // Створюємо об'єкт відповіді, щоб зберегти сесію в браузері користувача
        responseWithNewCookies = NextResponse.next();

        // Витягуємо "Set-Cookie" заголовки з відповіді Axios та копіюємо їх у NextResponse
        const setCookieHeader = response.headers["set-cookie"];
        if (setCookieHeader) {
          setCookieHeader.forEach((cookieStr) => {
            responseWithNewCookies?.headers.append("Set-Cookie", cookieStr);
          });
        }
        console.log(`[Proxy Guard]: Session successfully restored via checkSession()`);
      }
    } catch (error) {
      console.error("[Proxy Guard]: Session validation failed or expired:", error);
    }
  }

  // ПЕРЕВІРКА ПРИВАТНИХ МАРШРУТІВ
  const isPrivate = PRIVATE_ROUTES.some((route) => pathname.startsWith(route));
  if (isPrivate && !sessionToken) {
    const loginUrl = new URL(SIGN_IN_PATH, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // ПЕРЕВІРКА ПУБЛІЧНИХ МАРШРУТІВ (Виправлено редирект на головну /)
  const isPublic = PUBLIC_ROUTES.some((route) => pathname === route);
  if (isPublic && sessionToken) {
    // Якщо користувач авторизований, редирект має бути на головну сторінку (/), а не на сторінку входу
    if (pathname !== "/") {
      const homeUrl = new URL("/", request.url);
      const redirectResponse = NextResponse.redirect(homeUrl);

      // Передаємо нові куки у відповідь редиректу, якщо вони були оновлені
      if (responseWithNewCookies) {
        responseWithNewCookies.headers.forEach((value, key) => {
          if (key.toLowerCase() === "set-cookie") {
            redirectResponse.headers.append(key, value);
          }
        });
      }
      return redirectResponse;
    }
  }

  // Повертаємо відповідь з оновленими заголовками "Set-Cookie", або просто продовжуємо запит
  return responseWithNewCookies || NextResponse.next();
}

// // proxy.ts
// // ========
// // Проміжне програмне забезпечення для контролю доступу до приватних зон програми

// import { NextResponse } from "next/server";
// import { cookies } from "next/headers"; // АСИНХРОННЕ ЗЧИТУВАННЯ КУКІВ ДЛЯ НОВИХ ВЕРСІЙ NEXT.JS
// import type { NextRequest } from "next/server";

// const SIGN_IN_PATH = "/sign-in";
// const PROFILE_PATH = "/profile";
// const AUTH_TOKEN_KEY = "accessToken";

// const PRIVATE_ROUTES = ["/profile", "/notes"];
// const PUBLIC_ROUTES = ["/sign-in", "/sign-up", "/"];

// export const config = {
//   matcher: ["/notes/:path*", "/profile/:path*", "/sign-in", "/sign-up"],
// };

// export default async function proxy(request: NextRequest) {
//   // АСИНХРОННЕ ОТРИМАННЯ КУКІВ ЗГІДНО З РЕКОМЕНДАЦІЯМИ NEXT.JS PROXY API
//   const cookieStore = await cookies();
//   const sessionToken = cookieStore.get(AUTH_TOKEN_KEY);
//   const { pathname } = request.nextUrl;

//   console.log(`[Proxy Guard]: Route -> ${pathname} | Token Active -> ${!!sessionToken}`);

//   const isPrivate = PRIVATE_ROUTES.some((route) => pathname.startsWith(route));
//   if (isPrivate && !sessionToken) {
//     const loginUrl = new URL(SIGN_IN_PATH, request.url);
//     return NextResponse.redirect(loginUrl);
//   }

//   const isPublic = PUBLIC_ROUTES.some((route) => pathname === route);
//   if (isPublic && sessionToken && pathname !== PROFILE_PATH) {
//     const profileUrl = new URL(PROFILE_PATH, request.url);
//     return NextResponse.redirect(profileUrl);
//   }

//   return NextResponse.next();
// }
