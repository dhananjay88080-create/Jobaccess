import { z } from "zod";
import { JOB_CATEGORIES, INDIAN_STATES, JOB_TYPES, QUALIFICATIONS } from "@/lib/constants";

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  });

const optionalNumber = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    if (typeof value === "string") {
      const normalized = value.replace(/[, ]+/g, "").replace(/[^\d.-]/g, "");
      const parsed = Number(normalized);
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    return value;
  },
  z.number().nonnegative().optional()
);

const baseJobSchema = z.object({
  title: z.string().trim().min(6).max(220),
  description: z.string().trim().min(30).max(15000),
  organization: z.string().trim().min(2).max(160),
  category: z.enum(JOB_CATEGORIES),
  jobType: z.enum(JOB_TYPES),
  state: z.enum(INDIAN_STATES),
  qualification: z.enum(QUALIFICATIONS),
  lastDate: optionalDate,
  salaryMin: optionalNumber,
  salaryMax: optionalNumber,
  salaryCurrency: z.string().trim().min(1).max(10).optional().default("INR"),
  applyLink: z.string().url(),
  source: z.string().trim().min(2).max(120).default("Manual Entry"),
  sourceType: z.enum(["manual", "rss", "api", "html"]).default("manual")
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const addJobSchema = baseJobSchema
  .extend({
    status: z.enum(["pending", "published"]).default("published")
  })
  .superRefine((value, ctx) => {
    if (value.salaryMin !== undefined && value.salaryMax !== undefined && value.salaryMax < value.salaryMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["salaryMax"],
        message: "Salary max must be greater than or equal to salary min"
      });
    }
  });

export const updateJobSchema = baseJobSchema
  .partial()
  .extend({
    status: z.enum(["pending", "published", "rejected"]).optional()
  })
  .superRefine((value, ctx) => {
    if (value.salaryMin !== undefined && value.salaryMax !== undefined && value.salaryMax < value.salaryMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["salaryMax"],
        message: "Salary max must be greater than or equal to salary min"
      });
    }
    if (Object.keys(value).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one field is required"
      });
    }
  });

export const jobsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  category: z.string().optional(),
  jobType: z.enum(JOB_TYPES).optional(),
  state: z.string().optional(),
  qualification: z.string().optional(),
  q: z.string().trim().optional(),
  status: z.enum(["pending", "published", "rejected"]).optional()
});

export const emailSubscriptionSchema = z.object({
  email: z.string().email(),
  alertPreference: z.enum(["all", "government", "private"]).default("all")
});
