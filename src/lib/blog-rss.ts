import Parser from "rss-parser";
import { createBlogPost } from "@/lib/blogs";
import { sanitizeText } from "@/lib/utils";
import { SAFE_CONTENT_RSS_SOURCES } from "@/lib/sources";
import { BlogModel } from "@/models/Blog";

const parser = new Parser({
  timeout: 15_000
});

export interface ContentImportSummary {
  processed: number;
  created: number;
  skipped: number;
  errors: Array<{ source: string; reason: string }>;
}

function createBlogSourceUid(source: string, title: string) {
  return `${source}|${title}`.toLowerCase().trim();
}

export async function importContentFromRSSFeeds(): Promise<ContentImportSummary> {
  await BlogModel.updateMany(
    { sourceType: "rss", status: { $exists: false } },
    { $set: { status: "pending" }, $unset: { publishedAt: "" } }
  );

  const summary: ContentImportSummary = {
    processed: 0,
    created: 0,
    skipped: 0,
    errors: []
  };

  for (const source of SAFE_CONTENT_RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);
      const entries = feed.items || [];

      for (const item of entries) {
        const title = item.title?.trim();
        const rawContent = item.content || item.contentSnippet || item.summary || "";
        if (!title || !rawContent.trim()) {
          summary.skipped += 1;
          continue;
        }

        summary.processed += 1;
        const sourceUid = createBlogSourceUid(source.name, title);
        const existing = await BlogModel.findOne({ sourceUid }).lean();
        if (existing) {
          summary.skipped += 1;
          continue;
        }

        const content = sanitizeText(rawContent, 20000);
        const excerpt = sanitizeText(item.contentSnippet || content, 500).slice(0, 220);

        await createBlogPost({
          title,
          content,
          excerpt,
          sourceType: "rss",
          source: source.name,
          sourceUid,
          status: "pending",
          publishedAt: item.pubDate ? new Date(item.pubDate) : undefined
        });

        summary.created += 1;
      }
    } catch (error) {
      summary.errors.push({
        source: source.url,
        reason: error instanceof Error ? error.message : "Unknown content RSS import error"
      });
    }
  }

  return summary;
}
