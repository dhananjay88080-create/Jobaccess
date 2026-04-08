import { createJob } from "@/lib/jobs";
import { inferJobTypeFromText, normalizeJobType } from "@/lib/job-type";
import { SAFE_PUBLIC_API_SOURCES } from "@/lib/sources";
import { sanitizeText } from "@/lib/utils";

interface PublicApiJobItem {
  title: string;
  description?: string;
  organization?: string;
  category?: string;
  state?: string;
  qualification?: string;
  jobType?: string;
  applyLink: string;
  lastDate?: string;
  publishedDate?: string;
}

function parseItems(input: unknown): PublicApiJobItem[] {
  if (Array.isArray(input)) return input as PublicApiJobItem[];
  if (input && typeof input === "object" && "jobs" in input) {
    const jobs = (input as { jobs?: unknown }).jobs;
    if (Array.isArray(jobs)) return jobs as PublicApiJobItem[];
  }
  return [];
}

export async function importJobsFromPublicApis() {
  let processed = 0;
  let created = 0;
  let skipped = 0;
  const errors: Array<{ source: string; reason: string }> = [];

  for (const source of SAFE_PUBLIC_API_SOURCES) {
    try {
      const response = await fetch(source.url, { next: { revalidate: 0 } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const items = parseItems(data);

      for (const item of items) {
        if (!item.title || !item.applyLink) {
          skipped += 1;
          continue;
        }
        processed += 1;
        const description = sanitizeText(item.description || item.title);
        const inferredType =
          normalizeJobType(item.jobType) || inferJobTypeFromText(item.title, item.organization, item.description);
        const { created: wasCreated } = await createJob({
          title: item.title,
          description,
          organization: item.organization || "Government Recruitment Board",
          category: item.category || "Other",
          jobType: inferredType,
          state: item.state || "All India",
          qualification: item.qualification || "Any",
          lastDate: item.lastDate ? new Date(item.lastDate) : undefined,
          applyLink: item.applyLink,
          source: source.name,
          sourceType: "api",
          status: "pending",
          rssRawPublishedAt: item.publishedDate ? new Date(item.publishedDate) : undefined
        });
        if (wasCreated) created += 1;
        else skipped += 1;
      }
    } catch (error) {
      errors.push({
        source: source.url,
        reason: error instanceof Error ? error.message : "Unknown API import error"
      });
    }
  }

  return { processed, created, skipped, errors };
}
