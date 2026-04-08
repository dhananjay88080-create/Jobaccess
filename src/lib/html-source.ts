import { load } from "cheerio";
import { env } from "@/lib/env";
import { createJob } from "@/lib/jobs";
import { inferJobTypeFromText } from "@/lib/job-type";
import { SAFE_HTML_SOURCE_CONFIGS, type SafeHtmlSourceConfig } from "@/lib/sources";
import { sanitizeText } from "@/lib/utils";

interface ImportSummary {
  processed: number;
  created: number;
  skipped: number;
  errors: Array<{ source: string; reason: string }>;
}

function inferQualification(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("10th")) return "10th";
  if (lower.includes("12th")) return "12th";
  if (lower.includes("diploma")) return "Diploma";
  if (lower.includes("post graduate") || lower.includes("pg")) return "Post Graduate";
  if (lower.includes("graduate")) return "Graduate";
  if (lower.includes("engineer")) return "Engineering";
  if (lower.includes("medical")) return "Medical";
  return "Any";
}

function inferOrganization(title: string) {
  const parts = title.split(/[-|:]/).map((item) => item.trim()).filter(Boolean);
  return parts[0] || "Government Recruitment Board";
}

function splitCsv(value: string | undefined) {
  return (value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function isDomainAllowed(url: string) {
  const allowedDomains = splitCsv(env.ALLOWED_HTML_SOURCE_DOMAINS);
  if (!allowedDomains.length) return false;

  const hostname = new URL(url).hostname.toLowerCase();
  return allowedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

function parseRobotsRules(robotsTxt: string, userAgent: string) {
  const ua = userAgent.toLowerCase();
  const rules: Array<{ disallow: string[]; allow: string[]; agents: string[] }> = [];
  let current: { disallow: string[]; allow: string[]; agents: string[] } | null = null;

  for (const rawLine of robotsTxt.split("\n")) {
    const line = rawLine.split("#")[0]?.trim();
    if (!line) continue;

    const [fieldRaw, valueRaw] = line.split(":");
    if (!fieldRaw || valueRaw === undefined) continue;
    const field = fieldRaw.trim().toLowerCase();
    const value = valueRaw.trim();

    if (field === "user-agent") {
      if (!current || current.disallow.length || current.allow.length) {
        current = { disallow: [], allow: [], agents: [] };
        rules.push(current);
      }
      current.agents.push(value.toLowerCase());
      continue;
    }

    if (!current) continue;
    if (field === "disallow") current.disallow.push(value);
    if (field === "allow") current.allow.push(value);
  }

  const matchesAgent = (agent: string) => agent === "*" || ua.includes(agent);
  const matchedGroup = rules.find((group) => group.agents.some(matchesAgent));
  return matchedGroup || { disallow: [], allow: [], agents: [] };
}

function canCrawlPath(robotsTxt: string, userAgent: string, path: string) {
  const group = parseRobotsRules(robotsTxt, userAgent);
  const allowMatch = group.allow.filter(Boolean).find((rule) => path.startsWith(rule));
  const disallowMatch = group.disallow.filter(Boolean).find((rule) => path.startsWith(rule));
  if (allowMatch) return true;
  if (disallowMatch) return false;
  return true;
}

async function verifyRobotsPermission(listingUrl: string, userAgent: string) {
  const url = new URL(listingUrl);
  const robotsUrl = `${url.origin}/robots.txt`;

  try {
    const response = await fetch(robotsUrl, {
      headers: { "User-Agent": userAgent },
      cache: "no-store"
    });
    if (!response.ok) return { allowed: false, reason: `robots.txt unavailable (HTTP ${response.status})` };

    const robotsTxt = await response.text();
    const allowed = canCrawlPath(robotsTxt, userAgent, url.pathname || "/");
    if (!allowed) {
      return { allowed: false, reason: "robots.txt disallows crawling this path" };
    }
    return { allowed: true };
  } catch (error) {
    return {
      allowed: false,
      reason: error instanceof Error ? `robots.txt check failed: ${error.message}` : "robots.txt check failed"
    };
  }
}

function parseDateOrUndefined(value: string | undefined) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

async function importFromSingleHtmlSource(source: SafeHtmlSourceConfig, userAgent: string, summary: ImportSummary) {
  if (!isDomainAllowed(source.listingUrl)) {
    summary.errors.push({
      source: source.listingUrl,
      reason: "Domain is not allowlisted. Add it to ALLOWED_HTML_SOURCE_DOMAINS first."
    });
    return;
  }

  const robotsResult = await verifyRobotsPermission(source.listingUrl, userAgent);
  if (!robotsResult.allowed) {
    summary.errors.push({
      source: source.listingUrl,
      reason: robotsResult.reason || "robots.txt blocked crawling"
    });
    return;
  }

  const response = await fetch(source.listingUrl, {
    headers: {
      "User-Agent": userAgent,
      Accept: "text/html,application/xhtml+xml"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    summary.errors.push({
      source: source.listingUrl,
      reason: `Listing fetch failed with status ${response.status}`
    });
    return;
  }

  const html = await response.text();
  const $ = load(html);
  const items = $(source.itemSelector).toArray().slice(0, source.maxItems || 30);

  for (const element of items) {
    const item = $(element);
    const title = item.find(source.titleSelector).first().text().trim();
    const linkRaw = item.find(source.linkSelector).first().attr("href")?.trim();
    if (!title || !linkRaw) {
      summary.skipped += 1;
      continue;
    }

    let applyLink = "";
    try {
      applyLink = new URL(linkRaw, source.listingUrl).toString();
    } catch {
      summary.skipped += 1;
      continue;
    }

    const description = source.descriptionSelector ? item.find(source.descriptionSelector).first().text().trim() : title;
    const publishedRaw = source.publishedDateSelector
      ? item.find(source.publishedDateSelector).first().text().trim()
      : undefined;
    const publishedAt = parseDateOrUndefined(publishedRaw);
    const inferredType = source.jobType || inferJobTypeFromText(title, description, source.organization);

    summary.processed += 1;
    const { created } = await createJob({
      title,
      description: sanitizeText(description || title),
      organization: source.organization || inferOrganization(title),
      category: source.category || "Other",
      jobType: inferredType,
      state: source.state || "All India",
      qualification: source.qualification || inferQualification(title),
      applyLink,
      source: `${source.name} (HTML Adapter)`,
      sourceType: "html",
      status: "pending",
      rssRawPublishedAt: publishedAt
    });

    if (created) summary.created += 1;
    else summary.skipped += 1;
  }
}

export async function importJobsFromCompliantHtmlSources(): Promise<ImportSummary> {
  const summary: ImportSummary = {
    processed: 0,
    created: 0,
    skipped: 0,
    errors: []
  };

  if (env.ENABLE_HTML_SOURCE_IMPORT !== "true") {
    return summary;
  }

  const userAgent = env.HTML_SOURCE_USER_AGENT || "JobAccessBot/1.0 (+https://localhost)";
  for (const source of SAFE_HTML_SOURCE_CONFIGS) {
    try {
      await importFromSingleHtmlSource(source, userAgent, summary);
    } catch (error) {
      summary.errors.push({
        source: source.listingUrl,
        reason: error instanceof Error ? error.message : "Unknown HTML source import error"
      });
    }
  }

  return summary;
}
