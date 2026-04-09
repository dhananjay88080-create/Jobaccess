import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import { approveBlogById } from "@/lib/blogs";

interface Params {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: Params) {
  const limited = enforceRateLimit(request, "admin-blogs-approve", 50, 60_000);
  if (limited) return limited;

  if (!requireAdmin()) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const blog = await approveBlogById(params.id);
  if (!blog) {
    return NextResponse.json({ message: "Blog not found" }, { status: 404 });
  }

  return NextResponse.json({ blog });
}
