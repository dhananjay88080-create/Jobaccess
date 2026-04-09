import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listBlogs } from "@/lib/blogs";

export const metadata: Metadata = {
  title: "Blogs",
  description: "Latest blogs and content updates from JobAccess."
};

interface BlogsPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const page = Number(searchParams.page || "1");
  const currentPage = Number.isNaN(page) || page < 1 ? 1 : page;
  const { items, pagination } = await listBlogs(currentPage, 10);

  const buildPageLink = (nextPage: number) => `/blogs?page=${nextPage}`;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card/80 p-6 shadow-sm">
        <h1 className="font-[var(--font-heading)] text-3xl font-bold">Blogs</h1>
        <p className="mt-2 text-sm text-muted-foreground">Updates, guides, and useful content for job seekers.</p>
      </section>

      {items.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No blogs yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Admin can add blog content from dashboard.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((blog) => (
            <Card key={String(blog._id)} className="border-border/80 bg-card/95">
              <CardHeader className="space-y-2">
                <CardTitle className="line-clamp-2 text-lg">{blog.title}</CardTitle>
                <p className="text-xs text-muted-foreground">{new Date(blog.createdAt).toLocaleDateString("en-IN")}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="line-clamp-6 whitespace-pre-line text-sm text-muted-foreground">{blog.excerpt}</p>
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/blogs/${blog.slug}`}>Read More</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        {pagination.page <= 1 ? (
          <Button variant="outline" disabled>
            Previous
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href={buildPageLink(pagination.page - 1)}>Previous</Link>
          </Button>
        )}
        <span className="text-sm text-muted-foreground">
          Page {pagination.page} / {Math.max(pagination.totalPages, 1)}
        </span>
        {pagination.page >= pagination.totalPages ? (
          <Button variant="outline" disabled>
            Next
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href={buildPageLink(pagination.page + 1)}>Next</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
