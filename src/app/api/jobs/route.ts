import { NextRequest, NextResponse } from "next/server";
import { listJobs } from "@/lib/jobs";
import { jobsQuerySchema } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const limited = enforceRateLimit(request, "api-jobs", 80, 60_000);
  if (limited) return limited;

  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = jobsQuerySchema.safeParse({
    ...query,
    status: "published"
  });

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid query", errors: parsed.error.flatten() }, { status: 400 });
  }

  const data = await listJobs(parsed.data);
  return NextResponse.json(data);
}
