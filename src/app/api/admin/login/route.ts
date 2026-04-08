import { NextRequest, NextResponse } from "next/server";
import { adminLoginSchema } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/rate-limit";
import { signAdminToken, verifyAdminCredentials } from "@/lib/auth";
import { ADMIN_TOKEN_COOKIE } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, "admin-login", 10, 60_000);
  if (limited) return limited;

  const json = await request.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid credentials format" }, { status: 400 });
  }

  const isValid = await verifyAdminCredentials(parsed.data.email, parsed.data.password);
  if (!isValid) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  const token = signAdminToken({ email: parsed.data.email.toLowerCase(), role: "admin" });
  const response = NextResponse.json({ message: "Login successful" });
  response.cookies.set({
    name: ADMIN_TOKEN_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12
  });

  return response;
}
