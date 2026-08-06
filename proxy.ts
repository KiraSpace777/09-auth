// proxy.ts
// ========
// Проміжне програмне забезпечення для контролю доступу до приватних зон програми

import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // АСИНХРОННЕ ЗЧИТУВАННЯ КУКІВ ДЛЯ НОВИХ ВЕРСІЙ NEXT.JS
import type { NextRequest } from "next/server";

const SIGN_IN_PATH = "/sign-in";
const PROFILE_PATH = "/profile";
const AUTH_TOKEN_KEY = "accessToken";

const PRIVATE_ROUTES = ["/profile", "/notes"];
const PUBLIC_ROUTES = ["/sign-in", "/sign-up", "/"];

export const config = {
  matcher: ["/notes/:path*", "/profile/:path*", "/sign-in", "/sign-up"],
};

export default async function proxy(request: NextRequest) {
  // АСИНХРОННЕ ОТРИМАННЯ КУКІВ ЗГІДНО З РЕКОМЕНДАЦІЯМИ NEXT.JS PROXY API
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_TOKEN_KEY);
  const { pathname } = request.nextUrl;

  console.log(`[Proxy Guard]: Route -> ${pathname} | Token Active -> ${!!sessionToken}`);

  const isPrivate = PRIVATE_ROUTES.some((route) => pathname.startsWith(route));
  if (isPrivate && !sessionToken) {
    const loginUrl = new URL(SIGN_IN_PATH, request.url);
    return NextResponse.redirect(loginUrl);
  }

  const isPublic = PUBLIC_ROUTES.some((route) => pathname === route);
  if (isPublic && sessionToken && pathname !== PROFILE_PATH) {
    const profileUrl = new URL(PROFILE_PATH, request.url);
    return NextResponse.redirect(profileUrl);
  }

  return NextResponse.next();
}
