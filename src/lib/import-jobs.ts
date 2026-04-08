import { importJobsFromCompliantHtmlSources } from "@/lib/html-source";
import { importJobsFromPublicApis } from "@/lib/public-api";
import { importJobsFromRSSFeeds } from "@/lib/rss";

export async function importFromSafeSources() {
  const [rssSummary, apiSummary, htmlSummary] = await Promise.all([
    importJobsFromRSSFeeds(),
    importJobsFromPublicApis(),
    importJobsFromCompliantHtmlSources()
  ]);

  return {
    rss: rssSummary,
    api: apiSummary,
    html: htmlSummary,
    totals: {
      processed: rssSummary.processed + apiSummary.processed + htmlSummary.processed,
      created: rssSummary.created + apiSummary.created + htmlSummary.created,
      skipped: rssSummary.skipped + apiSummary.skipped + htmlSummary.skipped,
      errors: [...rssSummary.errors, ...apiSummary.errors, ...htmlSummary.errors]
    }
  };
}
