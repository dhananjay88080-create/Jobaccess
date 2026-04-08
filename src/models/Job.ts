import { model, models, Schema, type Model } from "mongoose";

export interface JobDocument {
  title: string;
  slug: string;
  description: string;
  organization: string;
  category: string;
  state: string;
  qualification: string;
  jobType: "government" | "private";
  lastDate?: Date;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  applyLink: string;
  source: string;
  sourceType: "rss" | "api" | "manual" | "html";
  sourceUid: string;
  rssRawPublishedAt?: Date;
  publishedAt?: Date;
  status: "pending" | "published" | "rejected";
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<JobDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 220 },
    slug: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true, maxlength: 15000 },
    organization: { type: String, required: true, trim: true, maxlength: 160 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    state: { type: String, required: true, trim: true, maxlength: 80 },
    qualification: { type: String, required: true, trim: true, maxlength: 120 },
    jobType: { type: String, enum: ["government", "private"], default: "government", index: true },
    lastDate: { type: Date },
    salaryMin: { type: Number, min: 0 },
    salaryMax: { type: Number, min: 0 },
    salaryCurrency: { type: String, trim: true, maxlength: 10, default: "INR" },
    applyLink: { type: String, required: true, trim: true, maxlength: 1000 },
    source: { type: String, required: true, trim: true, maxlength: 120 },
    sourceType: { type: String, enum: ["rss", "api", "manual", "html"], required: true },
    sourceUid: { type: String, required: true, unique: true, index: true },
    rssRawPublishedAt: { type: Date },
    publishedAt: { type: Date },
    status: { type: String, enum: ["pending", "published", "rejected"], default: "pending", index: true },
    views: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

JobSchema.index({ title: "text", description: "text", organization: "text" });
JobSchema.index({ jobType: 1, category: 1, state: 1, qualification: 1, status: 1, createdAt: -1 });
JobSchema.index({ slug: 1, status: 1 });

export const JobModel: Model<JobDocument> = models.Job || model<JobDocument>("Job", JobSchema);
