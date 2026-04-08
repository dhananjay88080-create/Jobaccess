import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { ADMIN_TOKEN_COOKIE } from "@/lib/constants";

export interface AdminTokenPayload {
  email: string;
  role: "admin";
}

export async function verifyAdminCredentials(email: string, password: string) {
  if (email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
    return false;
  }

  const isHashedPassword = env.ADMIN_PASSWORD.startsWith("$2a$") || env.ADMIN_PASSWORD.startsWith("$2b$");
  if (isHashedPassword) {
    return bcrypt.compare(password, env.ADMIN_PASSWORD);
  }

  return password === env.ADMIN_PASSWORD;
}

export function signAdminToken(payload: AdminTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "12h" });
}

export function verifyAdminToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as AdminTokenPayload;
}

export function getAdminTokenFromCookies() {
  return cookies().get(ADMIN_TOKEN_COOKIE)?.value;
}

export function isAdminAuthenticated() {
  try {
    const token = getAdminTokenFromCookies();
    if (!token) return false;
    verifyAdminToken(token);
    return true;
  } catch {
    return false;
  }
}
