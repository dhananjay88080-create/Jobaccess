import { NextRequest, NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE } from "@/lib/constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin/dashboard")) {
    const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
