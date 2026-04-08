import { env } from "@/lib/env";
import { importFromSafeSources } from "@/lib/import-jobs";

declare global {
  var jobAccessCronInitialized: boolean | undefined;
}

export async function startScheduler() {
  if (global.jobAccessCronInitialized) {
    return;
  }

  if (env.CRON_ENABLED === "false") {
    return;
  }

  const nodeCron = await import("node-cron");
  const scheduleJob = nodeCron.default?.schedule ?? nodeCron.schedule;
  if (!scheduleJob) {
    throw new Error("node-cron schedule function is unavailable");
  }

  const schedule = env.CRON_RSS_SCHEDULE || "0 */6 * * *";
  scheduleJob(schedule, async () => {
    try {
      const summary = await importFromSafeSources();
      console.log("[JobAccess] Safe source import summary:", summary);
    } catch (error) {
      console.error("[JobAccess] Safe source import failed:", error);
    }
  });

  global.jobAccessCronInitialized = true;
  console.log(`[JobAccess] Scheduler started with cron: ${schedule}`);
}
