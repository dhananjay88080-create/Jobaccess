import { NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE } from "@/lib/constants";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set({
    name: ADMIN_TOKEN_COOKIE,
    value: "",
    path: "/",
    maxAge: 0
  });
  return response;
}
