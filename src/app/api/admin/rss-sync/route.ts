import { NextRequest, NextResponse } from "next/server";
import { importFromSafeSources } from "@/lib/import-jobs";
import { requireAdmin } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, "admin-rss-sync", 8, 60_000);
  if (limited) return limited;

  const apiKey = request.headers.get("x-cron-key");
  const cronAccess = Boolean(env.CRON_API_KEY) && apiKey === env.CRON_API_KEY;
  if (!cronAccess && !requireAdmin()) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const summary = await importFromSafeSources();
  return NextResponse.json({ message: "Safe source sync complete", summary });
}
