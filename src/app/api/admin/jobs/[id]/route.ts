import { NextRequest, NextResponse } from "next/server";
import { deleteJobById, updateJobById } from "@/lib/jobs";
import { updateJobSchema } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requireAdmin } from "@/lib/api";
import { notifyOnPublishedJob } from "@/lib/notifier";

interface Params {
  params: { id: string };
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const limited = enforceRateLimit(request, "admin-jobs-patch", 60, 60_000);
  if (limited) return limited;
  if (!requireAdmin()) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = updateJobSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Validation failed", errors: parsed.error.flatten() }, { status: 400 });
  }

  const job = await updateJobById(params.id, parsed.data);
  if (!job) {
    return NextResponse.json({ message: "Job not found" }, { status: 404 });
  }

  if (parsed.data.status === "published") {
    void notifyOnPublishedJob({
      title: job.title,
      organization: job.organization,
      applyLink: job.applyLink,
      slug: job.slug,
      jobType: job.jobType === "private" ? "private" : "government"
    });
  }

  return NextResponse.json({ job });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const limited = enforceRateLimit(request, "admin-jobs-delete", 30, 60_000);
  if (limited) return limited;
  if (!requireAdmin()) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const job = await deleteJobById(params.id);
  if (!job) {
    return NextResponse.json({ message: "Job not found" }, { status: 404 });
  }
  return NextResponse.json({ message: "Deleted", id: params.id });
}
