import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import { listBlogsForAdmin } from "@/lib/blogs";

export async function GET(request: NextRequest) {
  const limited = enforceRateLimit(request, "admin-blogs-get", 80, 60_000);
  if (limited) return limited;

  if (!requireAdmin()) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const blogs = await listBlogsForAdmin(200);
  return NextResponse.json({ items: blogs });
}
