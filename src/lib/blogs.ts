import { connectToDatabase } from "@/lib/db";
import { makeSlug } from "@/lib/slug";
import { sanitizeText } from "@/lib/utils";
import { BlogModel } from "@/models/Blog";

interface CreateBlogInput {
  title: string;
  content: string;
  excerpt?: string;
}

function createExcerpt(content: string, providedExcerpt?: string) {
  if (providedExcerpt?.trim()) {
    return sanitizeText(providedExcerpt, 500);
  }

  return sanitizeText(content, 500).slice(0, 220);
}

export async function createBlogPost(input: CreateBlogInput) {
  await connectToDatabase();

  const title = sanitizeText(input.title, 180);
  const content = sanitizeText(input.content, 20000);
  const excerpt = createExcerpt(content, input.excerpt);
  const slugBase = makeSlug(title) || `blog-${Date.now()}`;

  const slugCollision = await BlogModel.findOne({ slug: slugBase }).lean();
  const slug = slugCollision ? `${slugBase}-${Date.now().toString().slice(-5)}` : slugBase;

  const blog = await BlogModel.create({
    title,
    slug,
    content,
    excerpt
  });

  return blog;
}

export async function getLatestBlogs(limit = 4) {
  await connectToDatabase();
  return BlogModel.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function listBlogs(page = 1, limit = 12) {
  await connectToDatabase();

  const [items, total] = await Promise.all([
    BlogModel.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    BlogModel.countDocuments()
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
  return BlogModel.findOne({ slug }).lean();
}

export async function listBlogsForAdmin(limit = 100) {
  await connectToDatabase();
  return BlogModel.find()
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

  return BlogModel.findByIdAndUpdate(id, payload, { new: true }).lean();
}

export async function deleteBlogById(id: string) {
  await connectToDatabase();
  return BlogModel.findByIdAndDelete(id).lean();
}
