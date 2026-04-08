import { env, rssFeeds } from "@/lib/env";

export interface SafeFeedSource {
  name: string;
  url: string;
}

export interface SafeHtmlSourceConfig {
  name: string;
  listingUrl: string;
  itemSelector: string;
  titleSelector: string;
  linkSelector: string;
  jobType?: "government" | "private";
  descriptionSelector?: string;
  publishedDateSelector?: string;
  organization?: string;
  category?: string;
  state?: string;
  qualification?: string;
  maxItems?: number;
}

// Keep this list to official/public sources with explicit feed access.
export const SAFE_RSS_SOURCES: SafeFeedSource[] = rssFeeds.map((url, index) => ({
  name: `Configured Feed ${index + 1}`,
  url
}));

export const SAFE_PUBLIC_API_SOURCES: SafeFeedSource[] = (env.PUBLIC_API_SOURCES || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean)
  .map((url, index) => ({
    name: `Configured Public API ${index + 1}`,
    url
  }));

function parseHtmlSourceConfig(): SafeHtmlSourceConfig[] {
  if (!env.HTML_SOURCE_CONFIG_JSON) return [];

  try {
    const parsed = JSON.parse(env.HTML_SOURCE_CONFIG_JSON) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => item as Partial<SafeHtmlSourceConfig>)
      .filter(
        (item): item is SafeHtmlSourceConfig =>
          typeof item.name === "string" &&
          typeof item.listingUrl === "string" &&
          typeof item.itemSelector === "string" &&
          typeof item.titleSelector === "string" &&
          typeof item.linkSelector === "string"
      )
      .map((item) => ({
        ...item,
        maxItems: item.maxItems && item.maxItems > 0 ? Math.min(item.maxItems, 100) : 30
      }));
  } catch (error) {
    console.error("[JobAccess] Invalid HTML_SOURCE_CONFIG_JSON:", error);
    return [];
  }
}

export const SAFE_HTML_SOURCE_CONFIGS: SafeHtmlSourceConfig[] = parseHtmlSourceConfig();
