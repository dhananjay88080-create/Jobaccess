import { connectToDatabase } from "@/lib/db";
import { makeSlug } from "@/lib/slug";
import { sanitizeText } from "@/lib/utils";
import { BlogModel } from "@/models/Blog";
import crypto from "crypto";

interface CreateBlogInput {
  title: string;
  content: string;
  excerpt?: string;
  sourceType?: "manual" | "rss" | "api";
  source?: string;
  sourceUid?: string;
  status?: "pending" | "published" | "rejected";
  publishedAt?: Date;
}

function createExcerpt(content: string, providedExcerpt?: string) {
  if (providedExcerpt?.trim()) {
    return sanitizeText(providedExcerpt, 500);
  }

  return sanitizeText(content, 500).slice(0, 220);
}

function createBlogSourceUid(input: Pick<CreateBlogInput, "title" | "source">) {
  const key = `${input.source || "Manual Entry"}|${input.title}`.toLowerCase();
  return crypto.createHash("sha256").update(key).digest("hex");
}

export async function createBlogPost(input: CreateBlogInput) {
  await connectToDatabase();

  const title = sanitizeText(input.title, 180);
  const content = sanitizeText(input.content, 20000);
  const excerpt = createExcerpt(content, input.excerpt);
  const sourceType = input.sourceType || "manual";
  const source = sanitizeText(input.source || "Manual Entry", 120);
  const status = sourceType === "rss" ? "pending" : input.status || "pending";
  const sourceUid = input.sourceUid || (sourceType === "manual" ? undefined : createBlogSourceUid({ title, source }));

  if (sourceUid) {
    const existingBySourceUid = await BlogModel.findOne({ sourceUid }).lean();
    if (existingBySourceUid) return existingBySourceUid;
  }

  const slugBase = makeSlug(title) || `blog-${Date.now()}`;

  const slugCollision = await BlogModel.findOne({ slug: slugBase }).lean();
  const slug = slugCollision ? `${slugBase}-${Date.now().toString().slice(-5)}` : slugBase;

  const blog = await BlogModel.create({
    title,
    slug,
    content,
    excerpt,
    sourceType,
    source,
    sourceUid,
    status,
    publishedAt: status === "published" ? input.publishedAt || new Date() : undefined
  });

  return blog;
}

export async function getLatestBlogs(limit = 4) {
  await connectToDatabase();
  return BlogModel.find({
    $or: [{ status: "published" }, { status: { $exists: false } }]
  })
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function listBlogs(page = 1, limit = 12) {
  await connectToDatabase();

  const [items, total] = await Promise.all([
    BlogModel.find({
      $or: [{ status: "published" }, { status: { $exists: false } }]
    })
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    BlogModel.countDocuments({
      $or: [{ status: "published" }, { status: { $exists: false } }]
    })
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  };
}

export async function getBlogBySlug(slug: string) {
  await connectToDatabase();
  return BlogModel.findOne({
    slug,
    $or: [{ status: "published" }, { status: { $exists: false } }]
  }).lean();
}

export async function listBlogsForAdmin(
  status?: "pending" | "published" | "rejected",
  limit = 100
) {
  await connectToDatabase();
  const query =
    status === "published"
      ? { $or: [{ status: "published" }, { status: { $exists: false } }] }
      : status
        ? { status }
        : {};

  return BlogModel.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function updateBlogById(
  id: string,
  input: Partial<CreateBlogInput>
) {
  await connectToDatabase();

  const existing = await BlogModel.findById(id);
  if (!existing) return null;

  const payload: Partial<{
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    sourceType: "manual" | "rss" | "api";
    source: string;
    sourceUid: string;
    status: "pending" | "published" | "rejected";
    publishedAt: Date;
  }> = {};

  if (input.title !== undefined) {
    const nextTitle = sanitizeText(input.title, 180);
    payload.title = nextTitle;

    const slugBase = makeSlug(nextTitle) || `blog-${Date.now()}`;
    const slugConflict = await BlogModel.findOne({ slug: slugBase, _id: { $ne: id } }).lean();
    payload.slug = slugConflict ? `${slugBase}-${Date.now().toString().slice(-5)}` : slugBase;
  }

  let nextContent: string | undefined;
  if (input.content !== undefined) {
    nextContent = sanitizeText(input.content, 20000);
    payload.content = nextContent;
  }

  if (input.excerpt !== undefined) {
    payload.excerpt = sanitizeText(input.excerpt, 500);
  } else if (nextContent !== undefined) {
    payload.excerpt = createExcerpt(nextContent);
  }

  if (input.sourceType !== undefined) {
    payload.sourceType = input.sourceType;
  }

  if (input.source !== undefined) {
    payload.source = sanitizeText(input.source, 120);
  }

  if (input.sourceUid !== undefined) {
    payload.sourceUid = input.sourceUid;
  }

  if (input.publishedAt !== undefined) {
    payload.publishedAt = input.publishedAt;
  }

  if (input.status !== undefined) {
    payload.status = input.status;
    if (input.status === "published") {
      payload.publishedAt = input.publishedAt || new Date();
    }
  }

  return BlogModel.findByIdAndUpdate(id, payload, { new: true }).lean();
}

export async function approveBlogById(id: string) {
  await connectToDatabase();
  return BlogModel.findByIdAndUpdate(
    id,
    { status: "published", publishedAt: new Date() },
    { new: true }
  ).lean();
}

export async function deleteBlogById(id: string) {
  await connectToDatabase();
  return BlogModel.findByIdAndDelete(id).lean();
}
