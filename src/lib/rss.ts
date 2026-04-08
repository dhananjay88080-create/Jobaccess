import Parser from "rss-parser";
import { SAFE_RSS_SOURCES } from "@/lib/sources";
import { createJob } from "@/lib/jobs";
import { inferJobTypeFromText } from "@/lib/job-type";
import { sanitizeText } from "@/lib/utils";

const parser = new Parser({
  timeout: 15_000
});

interface ImportSummary {
  processed: number;
  created: number;
  skipped: number;
  errors: Array<{ source: string; reason: string }>;
}

function inferCategory(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("railway")) return "Railway";
  if (lower.includes("bank")) return "Banking";
  if (lower.includes("army") || lower.includes("navy") || lower.includes("air force")) return "Defence";
  if (lower.includes("teacher") || lower.includes("lecturer")) return "Teaching";
  if (lower.includes("engineer")) return "Engineering";
  if (lower.includes("medical") || lower.includes("nursing")) return "Healthcare";
  if (lower.includes("state")) return "State Government";
  if (lower.includes("central")) return "Central Government";
  return "Other";
}

function inferQualification(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("10th")) return "10th";
  if (lower.includes("12th")) return "12th";
  if (lower.includes("diploma")) return "Diploma";
  if (lower.includes("post graduate") || lower.includes("pg")) return "Post Graduate";
  if (lower.includes("graduate")) return "Graduate";
  if (lower.includes("engineer")) return "Engineering";
  return "Any";
}

function inferState(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("delhi")) return "Delhi";
  if (lower.includes("maharashtra")) return "Maharashtra";
  if (lower.includes("karnataka")) return "Karnataka";
  if (lower.includes("tamil nadu")) return "Tamil Nadu";
  if (lower.includes("uttar pradesh")) return "Uttar Pradesh";
  return "All India";
}

function inferOrganization(title: string) {
  const parts = title.split(/[-|:]/).map((item) => item.trim()).filter(Boolean);
  return parts[0] || "Government Recruitment Board";
}

export async function importJobsFromRSSFeeds(): Promise<ImportSummary> {
  const summary: ImportSummary = {
    processed: 0,
    created: 0,
    skipped: 0,
    errors: []
  };

  for (const source of SAFE_RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);
      const entries = feed.items || [];

      for (const item of entries) {
        const title = item.title?.trim();
        const descriptionRaw = item.contentSnippet || item.content || item.summary || "";
        const applyLink = item.link?.trim();
        if (!title || !applyLink) {
          summary.skipped += 1;
          continue;
        }

        summary.processed += 1;
        const description = sanitizeText(descriptionRaw || title);
        const publishedAt = item.pubDate ? new Date(item.pubDate) : undefined;
        const jobType = inferJobTypeFromText(title, description);

        const { created } = await createJob({
          title,
          description,
          organization: inferOrganization(title),
          category: inferCategory(title),
          jobType,
          state: inferState(title),
          qualification: inferQualification(title),
          applyLink,
          source: source.name,
          sourceType: "rss",
          status: "pending",
          rssRawPublishedAt: publishedAt
        });

        if (created) {
          summary.created += 1;
        } else {
          summary.skipped += 1;
        }
      }
    } catch (error) {
      summary.errors.push({
        source: source.url,
        reason: error instanceof Error ? error.message : "Unknown RSS parsing error"
      });
    }
  }

  return summary;
}
