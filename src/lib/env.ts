import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars"),
  ADMIN_EMAIL: z.string().email("ADMIN_EMAIL must be a valid email"),
  ADMIN_PASSWORD: z.string().min(8, "ADMIN_PASSWORD must be at least 8 chars"),
  APP_URL: z.string().url("APP_URL should be a valid URL"),
  RSS_FEED_URLS: z.string().optional().default(""),
  PUBLIC_API_SOURCES: z.string().optional(),
  ENABLE_HTML_SOURCE_IMPORT: z.string().optional(),
  ALLOWED_HTML_SOURCE_DOMAINS: z.string().optional(),
  HTML_SOURCE_CONFIG_JSON: z.string().optional(),
  HTML_SOURCE_USER_AGENT: z.string().optional(),
  CRON_ENABLED: z.string().optional(),
  CRON_RSS_SCHEDULE: z.string().optional(),
  CRON_API_KEY: z.string().optional(),
  ADSENSE_CLIENT_ID: z.string().optional(),
  ADSENSE_TOP_SLOT: z.string().optional(),
  ADSENSE_IN_CONTENT_SLOT: z.string().optional(),
  ADSENSE_SIDEBAR_SLOT: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional()
});

const parsed = schema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  APP_URL: process.env.APP_URL,
  RSS_FEED_URLS: process.env.RSS_FEED_URLS,
  PUBLIC_API_SOURCES: process.env.PUBLIC_API_SOURCES,
  ENABLE_HTML_SOURCE_IMPORT: process.env.ENABLE_HTML_SOURCE_IMPORT,
  ALLOWED_HTML_SOURCE_DOMAINS: process.env.ALLOWED_HTML_SOURCE_DOMAINS,
  HTML_SOURCE_CONFIG_JSON: process.env.HTML_SOURCE_CONFIG_JSON,
  HTML_SOURCE_USER_AGENT: process.env.HTML_SOURCE_USER_AGENT,
  CRON_ENABLED: process.env.CRON_ENABLED,
  CRON_RSS_SCHEDULE: process.env.CRON_RSS_SCHEDULE,
  CRON_API_KEY: process.env.CRON_API_KEY,
  ADSENSE_CLIENT_ID: process.env.ADSENSE_CLIENT_ID,
  ADSENSE_TOP_SLOT: process.env.ADSENSE_TOP_SLOT,
  ADSENSE_IN_CONTENT_SLOT: process.env.ADSENSE_IN_CONTENT_SLOT,
  ADSENSE_SIDEBAR_SLOT: process.env.ADSENSE_SIDEBAR_SLOT,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM
});

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  throw new Error(`Invalid environment variables:\n${issues.join("\n")}`);
}

export const env = parsed.data;

export const rssFeeds = env.RSS_FEED_URLS.split(",")
  .map((item) => item.trim())
  .filter(Boolean);
