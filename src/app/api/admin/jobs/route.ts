import { NextRequest, NextResponse } from "next/server";
import { listJobs } from "@/lib/jobs";
import { jobsQuerySchema } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requireAdmin } from "@/lib/api";

export async function GET(request: NextRequest) {
  const limited = enforceRateLimit(request, "admin-jobs-get", 120, 60_000);
  if (limited) return limited;
  if (!requireAdmin()) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = jobsQuerySchema.safeParse(query);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid query", errors: parsed.error.flatten() }, { status: 400 });
  }

  const data = await listJobs(parsed.data);
  return NextResponse.json(data);
}
