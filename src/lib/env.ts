import { z } from "zod";

const defaultAppUrl =
  process.env.APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).catch("development"),
  MONGODB_URI: z.string().min(1).catch("mongodb://127.0.0.1:27017/jobaccess"),
  JWT_SECRET: z.string().min(16).catch("replace_with_a_long_random_secret_key_12345"),
  ADMIN_EMAIL: z.string().email().catch("admin@example.com"),
  ADMIN_PASSWORD: z.string().min(8).catch("ChangeThisPassword123"),
  APP_URL: z.string().url().catch(defaultAppUrl),
  RSS_FEED_URLS: z.string().optional().default(""),
  PUBLIC_API_SOURCES: z.string().optional().default(""),
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

const criticalVars = ["MONGODB_URI", "JWT_SECRET", "ADMIN_EMAIL", "ADMIN_PASSWORD", "APP_URL"] as const;
const missingCriticalVars = criticalVars.filter((key) => {
  const value = process.env[key];
  return !value || !value.trim();
});

if (missingCriticalVars.length > 0 && process.env.NODE_ENV === "production") {
  console.warn(`[env] Missing vars in production: ${missingCriticalVars.join(", ")}. Using fallback values.`);
}

export const env = schema.parse({
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  APP_URL: process.env.APP_URL || defaultAppUrl,
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

export const rssFeeds = env.RSS_FEED_URLS.split(",")
  .map((item) => item.trim())
  .filter(Boolean);
