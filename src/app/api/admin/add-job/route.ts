import { NextRequest, NextResponse } from "next/server";
import { addJobSchema } from "@/lib/validation";
import { createJob, updateJobById } from "@/lib/jobs";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requireAdmin } from "@/lib/api";
import { notifyOnPublishedJob } from "@/lib/notifier";

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, "admin-add-job", 30, 60_000);
  if (limited) return limited;

  if (!requireAdmin()) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = addJobSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Validation failed", errors: parsed.error.flatten() }, { status: 400 });
  }

  const payload = {
    ...parsed.data,
    sourceType: "manual" as const
  };

  const result = await createJob(payload);
  const created = result.created;
  const existingJob = result.job;

  let duplicateUpdated = false;
  const updatedExisting = !created ? await updateJobById(String(existingJob._id), payload) : null;
  if (!created && updatedExisting) {
    duplicateUpdated = true;
  }

  const finalJob = updatedExisting || existingJob;
  if (finalJob.status === "published" && (created || duplicateUpdated)) {
    void notifyOnPublishedJob({
      title: finalJob.title,
      organization: finalJob.organization,
      applyLink: finalJob.applyLink,
      slug: finalJob.slug,
      jobType: finalJob.jobType === "private" ? "private" : "government"
    });
  }

  return NextResponse.json({ job: finalJob, created, duplicateUpdated }, { status: created ? 201 : 200 });
}
