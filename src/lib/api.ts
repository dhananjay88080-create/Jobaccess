import { NextRequest } from "next/server";
import { getAdminTokenFromCookies, verifyAdminToken } from "@/lib/auth";

export function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return "unknown";
}

export function requireAdmin() {
  const token = getAdminTokenFromCookies();
  if (!token) {
    return false;
  }

  try {
    verifyAdminToken(token);
    return true;
  } catch {
    return false;
  }
}
