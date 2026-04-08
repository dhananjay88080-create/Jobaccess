export type JobType = "government" | "private";

export function normalizeJobType(value: unknown): JobType | undefined {
  if (typeof value !== "string") return undefined;

  const normalized = value.trim().toLowerCase();

  if (["government", "govt", "gov"].includes(normalized)) {
    return "government";
  }

  if (["private", "pvt"].includes(normalized)) {
    return "private";
  }

  return undefined;
}

export function inferJobTypeFromText(
  ...parts: Array<string | undefined>
): JobType | undefined {
  const text = parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const govtSignals = [
    "government",
    "govt",
    "ministry",
    "commission",
    "department",
    "railway",
    "defence",
    "upsc",
    "ssc",
    "psu",
    "public sector",
    "state government",
    "central government",
    "recruitment",
    "notification",
    "vacancy",
    "exam"
  ];

  if (govtSignals.some(token => new RegExp(`\\b${token}\\b`).test(text))) {
    return "government";
  }

  const privateSignals = [
    "private",
    "pvt",
    "startup",
    "mnc",
    "corporate",
    "company hiring",
    "walk-in interview",
    "job opening",
    "hiring now",
    "apply now"
  ];

  if (privateSignals.some(token => new RegExp(`\\b${token}\\b`).test(text))) {
    return "private";
  }

  return undefined; 
}