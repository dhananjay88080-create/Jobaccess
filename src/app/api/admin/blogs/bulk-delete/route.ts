import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import { deleteBlogsByIds } from "@/lib/blogs";

const schema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1)
});

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, "admin-blogs-bulk-delete", 20, 60_000);
  if (limited) return limited;

  if (!requireAdmin()) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload", errors: parsed.error.flatten() }, { status: 400 });
  }

  const result = await deleteBlogsByIds(parsed.data.ids);
  return NextResponse.json({ deleted: result.deletedCount || 0 });
}
