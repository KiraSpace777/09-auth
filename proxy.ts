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
  if (!sessionToken) {
    try {
      const response = await checkSession();

      if (response && response.status === 200) {
        // Створюємо об'єкт відповіді Next.js Middleware
        responseWithNewCookies = NextResponse.next();

        // НОРМАЛІЗАЦІЯ ЗАГОЛОВКА SET-COOKIE (Рядок або Масив)
        const rawSetCookie = response.headers["set-cookie"];
        let setCookieHeader: string[] = [];

        if (rawSetCookie) {
          if (Array.isArray(rawSetCookie)) {
            setCookieHeader = rawSetCookie;
          } else {
            setCookieHeader = [rawSetCookie];
          }
        }

        // БЕЗПЕЧНА ІТЕРАЦІЯ ТА СУМІСНЕ ВСТАНОВЛЕННЯ COOKIES В NEXTRESPONSE
        setCookieHeader.forEach((cookieStr) => {
          // Додаємо заголовок у вихідну відповідь для браузера
          responseWithNewCookies?.headers.append("Set-Cookie", cookieStr);

          // ПАРСИНГ КУКИ ДЛЯ ОНОВЛЕННЯ ВНУТРІШНЬОГО СТАНУ MIDDLEWARE
          const parts = cookieStr.split(";");
          const firstPart = parts[0];
          if (firstPart) {
            const equalSignIndex = firstPart.indexOf("=");
            if (equalSignIndex !== -1) {
              const key = firstPart.substring(0, equalSignIndex).trim();
              const value = firstPart.substring(equalSignIndex + 1).trim();

              // Обов'язково фіксуємо токен у Middleware відповіді через офіційне API .cookies.set
              responseWithNewCookies?.cookies.set(key, value, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
              });

              // Якщо оновився саме accessToken, зберігаємо його для поточних перевірок маршрутів
              if (key === AUTH_TOKEN_KEY) {
                sessionToken = value;
              }
            }
          }
        });

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

  // ПЕРЕВІРКА ПУБЛІЧНИХ МАРШРУТІВ (Виправлено редирект з /profile на головну /)
  const isPublic = PUBLIC_ROUTES.some((route) => pathname === route);
  if (isPublic && sessionToken) {
    if (pathname !== "/") {
      const homeUrl = new URL("/", request.url);
      const redirectResponse = NextResponse.redirect(homeUrl);

      // Копіюємо заголовки Set-Cookie та cookies у відповідь редиректу
      if (responseWithNewCookies) {
        responseWithNewCookies.headers.forEach((value, key) => {
          if (key.toLowerCase() === "set-cookie") {
            redirectResponse.headers.append(key, value);
          }
        });

        responseWithNewCookies.cookies.getAll().forEach((cookie) => {
          redirectResponse.cookies.set(cookie.name, cookie.value, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });
        });
      }
      return redirectResponse;
    }
  }

  // Повертаємо відповідь з оновленими токенами або продовжуємо запит
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
