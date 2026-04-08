import crypto from "crypto";
import { FilterQuery } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { makeSlug } from "@/lib/slug";
import { sanitizeText } from "@/lib/utils";
import { JobDocument, JobModel } from "@/models/Job";
import { JOB_TYPES } from "@/lib/constants";
import { normalizeJobType, inferJobTypeFromText } from "@/lib/job-type"; 

export interface CreateJobInput {
  title: string;
  description: string;
  organization: string;
  category: string;
  state: string;
  qualification: string;
  jobType?: (typeof JOB_TYPES)[number];
  lastDate?: Date;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  applyLink: string;
  source: string;
  sourceType: "manual" | "rss" | "api" | "html";
  sourceUid?: string;
  status?: "pending" | "published" | "rejected";
  rssRawPublishedAt?: Date;
}

export interface JobsFilter {
  page?: number;
  limit?: number;
  category?: string;
  state?: string;
  qualification?: string;
  jobType?: (typeof JOB_TYPES)[number];
  q?: string;
  status?: "pending" | "published" | "rejected";
}

function createSourceUid(input: Pick<CreateJobInput, "applyLink" | "title" | "source">) {
  const key = `${input.source}|${input.applyLink}|${input.title}`.toLowerCase();
  return crypto.createHash("sha256").update(key).digest("hex");
}

export async function createJob(input: CreateJobInput) {
  await connectToDatabase();

  const slugBase = makeSlug(input.title);
  const sourceUid = input.sourceUid || createSourceUid(input);

  const existing = await JobModel.findOne({ sourceUid });
  if (existing) {
    return { job: existing, created: false };
  }

  const slugCollision = await JobModel.findOne({ slug: slugBase });
  const slug = slugCollision
    ? `${slugBase}-${Date.now().toString().slice(-5)}`
    : slugBase;

  const description = sanitizeText(input.description, 15000);
  const status = input.status || "pending";

  const resolvedJobType =
    normalizeJobType(input.jobType) ??
    inferJobTypeFromText(input.title, input.description, input.organization) ??
    "private";

  const job = await JobModel.create({
    ...input,
    description,
    slug,
    sourceUid,
    status,
    publishedAt: status === "published" ? new Date() : undefined,
    salaryCurrency: input.salaryCurrency || "INR",
    salaryMin: input.salaryMin ?? null,
    salaryMax: input.salaryMax ?? null,

    jobType: resolvedJobType
  });

  return { job, created: true };
}

export async function listJobs(filter: JobsFilter = {}) {
  await connectToDatabase();

  const page = filter.page || 1;
  const limit = filter.limit || 10;

  const query: FilterQuery<JobDocument> = {};

  if (filter.status) query.status = filter.status;
  if (filter.category) query.category = filter.category;
  if (filter.state) query.state = filter.state;
  if (filter.qualification) query.qualification = filter.qualification;
  if (filter.jobType) {
    query.jobType = filter.jobType;
  }

  if (filter.q) {
    query.$text = { $search: filter.q };
  }

  const [items, total] = await Promise.all([
    JobModel.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    JobModel.countDocuments(query)
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getJobById(id: string) {
  await connectToDatabase();
  return JobModel.findById(id).lean();
}

export async function getJobBySlug(slug: string, incrementViews = false) {
  await connectToDatabase();

  if (incrementViews) {
    return JobModel.findOneAndUpdate(
      { slug, status: "published" },
      { $inc: { views: 1 } },
      { new: true }
    ).lean();
  }

  return JobModel.findOne({ slug, status: "published" }).lean();
}

export async function updateJobById(
  id: string,
  update: Partial<CreateJobInput> & { status?: JobDocument["status"] }
) {
  await connectToDatabase();

  const payload: Partial<JobDocument> = Object.fromEntries(
    Object.entries(update).filter(([, value]) => value !== undefined)
  ) as Partial<JobDocument>;

  if (update.title) {
    payload.slug = makeSlug(update.title);
  }

  if (update.description) {
    payload.description = sanitizeText(update.description, 15000);
  }

  if (update.status === "published") {
    payload.publishedAt = new Date();
  }

  // ✅ FIX JOB TYPE ON UPDATE ALSO
  if (update.jobType) {
    payload.jobType = normalizeJobType(update.jobType);
  }

  return JobModel.findByIdAndUpdate(id, payload, { new: true }).lean();
}

export async function deleteJobById(id: string) {
  await connectToDatabase();
  return JobModel.findByIdAndDelete(id).lean();
}

export async function deleteJobsByIds(ids: string[]) {
  await connectToDatabase();
  return JobModel.deleteMany({ _id: { $in: ids } });
}

export async function getTrendingJobs(limit = 5) {
  await connectToDatabase();
  return JobModel.find({ status: "published" })
    .sort({ views: -1, publishedAt: -1 })
    .limit(limit)
    .lean();
}