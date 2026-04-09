import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import { deleteBlogById, updateBlogById } from "@/lib/blogs";
import { updateBlogSchema } from "@/lib/validation";

interface Params {
  params: { id: string };
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const limited = enforceRateLimit(request, "admin-blogs-patch", 60, 60_000);
  if (limited) return limited;

  if (!requireAdmin()) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = updateBlogSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Validation failed", errors: parsed.error.flatten() }, { status: 400 });
  }

  const blog = await updateBlogById(params.id, parsed.data);
  if (!blog) {
    return NextResponse.json({ message: "Blog not found" }, { status: 404 });
  }

  return NextResponse.json({ blog });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const limited = enforceRateLimit(request, "admin-blogs-delete", 30, 60_000);
  if (limited) return limited;

  if (!requireAdmin()) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const blog = await deleteBlogById(params.id);
  if (!blog) {
    return NextResponse.json({ message: "Blog not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Deleted", id: params.id });
}
