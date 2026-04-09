import { model, models, Schema, type Model } from "mongoose";

export interface BlogDocument {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  sourceType: "manual" | "rss" | "api";
  source: string;
  sourceUid?: string;
  status: "pending" | "published" | "rejected";
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<BlogDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, trim: true, unique: true, index: true, maxlength: 100 },
    content: { type: String, required: true, maxlength: 20000 },
    excerpt: { type: String, required: true, maxlength: 500 },
    sourceType: { type: String, enum: ["manual", "rss", "api"], default: "manual", index: true },
    source: { type: String, required: true, trim: true, maxlength: 120, default: "Manual Entry" },
    sourceUid: { type: String, trim: true, index: true, sparse: true, unique: true },
    status: { type: String, enum: ["pending", "published", "rejected"], default: "pending", index: true },
    publishedAt: { type: Date }
  },
  {
    timestamps: true
  }
);

BlogSchema.index({ createdAt: -1 });
BlogSchema.index({ sourceType: 1, createdAt: -1 });
BlogSchema.index({ status: 1, createdAt: -1 });

export const BlogModel: Model<BlogDocument> = models.Blog || model<BlogDocument>("Blog", BlogSchema);
