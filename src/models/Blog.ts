import { model, models, Schema, type Model } from "mongoose";

export interface BlogDocument {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<BlogDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, trim: true, unique: true, index: true, maxlength: 100 },
    content: { type: String, required: true, maxlength: 20000 },
    excerpt: { type: String, required: true, maxlength: 500 }
  },
  {
    timestamps: true
  }
);

BlogSchema.index({ createdAt: -1 });

export const BlogModel: Model<BlogDocument> = models.Blog || model<BlogDocument>("Blog", BlogSchema);
