import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requireAdmin } from "@/lib/api";
import { deleteJobsByIds } from "@/lib/jobs";

const bulkDeleteSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1).max(200)
});

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, "admin-jobs-bulk-delete", 10, 60_000);
  if (limited) return limited;
  if (!requireAdmin()) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = bulkDeleteSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid ids payload", errors: parsed.error.flatten() }, { status: 400 });
  }

  const result = await deleteJobsByIds(parsed.data.ids);
  return NextResponse.json({
    message: "Bulk delete complete",
    requested: parsed.data.ids.length,
    deleted: result.deletedCount || 0
  });
}
