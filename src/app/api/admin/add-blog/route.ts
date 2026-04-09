import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import { addBlogSchema } from "@/lib/validation";
import { createBlogPost } from "@/lib/blogs";

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, "admin-add-blog", 20, 60_000);
  if (limited) return limited;

  if (!requireAdmin()) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = addBlogSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Validation failed", errors: parsed.error.flatten() }, { status: 400 });
  }

  const blog = await createBlogPost(parsed.data);
  return NextResponse.json({ blog }, { status: 201 });
}
