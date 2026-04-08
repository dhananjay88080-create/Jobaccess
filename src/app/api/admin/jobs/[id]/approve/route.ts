import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requireAdmin } from "@/lib/api";
import { updateJobById } from "@/lib/jobs";
import { notifyOnPublishedJob } from "@/lib/notifier";

interface Params {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: Params) {
  const limited = enforceRateLimit(request, "admin-jobs-approve", 40, 60_000);
  if (limited) return limited;
  if (!requireAdmin()) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const job = await updateJobById(params.id, { status: "published" });
  if (!job) return NextResponse.json({ message: "Job not found" }, { status: 404 });

  void notifyOnPublishedJob({
    title: job.title,
    organization: job.organization,
    applyLink: job.applyLink,
    slug: job.slug,
    jobType: job.jobType === "private" ? "private" : "government"
  });

  return NextResponse.json({ message: "Approved and published", job });
}
