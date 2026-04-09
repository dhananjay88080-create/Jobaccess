import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBlogBySlug } from "@/lib/blogs";

interface BlogPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const blog = await getBlogBySlug(params.slug);
  if (!blog) {
    return {
      title: "Blog Not Found"
    };
  }

  return {
    title: `${blog.title} | JobAccess Blogs`,
    description: blog.excerpt,
    alternates: {
      canonical: `/blogs/${blog.slug}`
    }
  };
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const blog = await getBlogBySlug(params.slug);
  if (!blog) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button asChild variant="ghost">
        <Link href="/blogs" className="inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to blogs
        </Link>
      </Button>

      <Card className="border-border/80 bg-card/95">
        <CardHeader className="space-y-3">
          <CardTitle className="font-[var(--font-heading)] text-2xl md:text-3xl">{blog.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{new Date(blog.createdAt).toLocaleDateString("en-IN")}</p>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{blog.content}</p>
        </CardContent>
      </Card>
    </div>
  );
}
