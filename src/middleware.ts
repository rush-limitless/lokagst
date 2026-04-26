import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

export async function middleware(request: NextRequest) {
  const isSecure = request.nextUrl.protocol === "https:";
  const token = await getToken({
    req: request,
    secret,
    cookieName: isSecure ? "__Secure-authjs.session-token" : "authjs.session-token",
  });

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|manifest.json|logo.jpg|icon-192.png|icon-512.png|apple-touch-icon.png|favicon-16x16.png|favicon-32x32.png).*)"],
};
