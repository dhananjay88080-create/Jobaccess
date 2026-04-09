import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import { listBlogsForAdmin } from "@/lib/blogs";
import { blogsQuerySchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const limited = enforceRateLimit(request, "admin-blogs-get", 80, 60_000);
  if (limited) return limited;

  if (!requireAdmin()) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = blogsQuerySchema.safeParse(query);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid query", errors: parsed.error.flatten() }, { status: 400 });
  }

  const blogs = await listBlogsForAdmin(parsed.data.status, 200);
  return NextResponse.json({ items: blogs });
}
