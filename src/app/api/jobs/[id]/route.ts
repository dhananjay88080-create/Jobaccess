import { NextRequest, NextResponse } from "next/server";
import { getJobById } from "@/lib/jobs";
import { enforceRateLimit } from "@/lib/rate-limit";

interface Params {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Params) {
  const limited = enforceRateLimit(request, "api-jobs-id", 100, 60_000);
  if (limited) return limited;

  const job = await getJobById(params.id).catch(() => null);
  if (!job || job.status !== "published") {
    return NextResponse.json({ message: "Job not found" }, { status: 404 });
  }

  return NextResponse.json(job);
}
