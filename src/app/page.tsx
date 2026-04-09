import Link from "next/link";
import { AdSlot } from "@/components/ads/ad-slot";
import { JobCard } from "@/components/jobs/job-card";
import { JobsFilters } from "@/components/jobs/jobs-filters";
import { SubscribeForm } from "@/components/jobs/subscribe-form";
import { TrendingJobs } from "@/components/jobs/trending-jobs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listJobs, getTrendingJobs } from "@/lib/jobs";
import { getLatestBlogs } from "@/lib/blogs";
import { adsense } from "@/lib/adsense";
import type { JobsFilter } from "@/lib/jobs";

interface HomePageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const page = Number(searchParams.page || "1");
  const rawJobType = typeof searchParams.jobType === "string" ? searchParams.jobType : undefined;
  const jobType: JobsFilter["jobType"] = rawJobType === "government" || rawJobType === "private" ? rawJobType : undefined;
  const query: JobsFilter = {
    page: Number.isNaN(page) || page < 1 ? 1 : page,
    limit: 12,
    jobType,
    q: typeof searchParams.q === "string" ? searchParams.q : undefined,
    status: "published" as const
  };

  const [{ items, pagination }, trendingJobs, blogs] = await Promise.all([listJobs(query), getTrendingJobs(6), getLatestBlogs(4)]);

  const buildPageLink = (nextPage: number) => {
    const params = new URLSearchParams();
    if (query.jobType) params.set("jobType", query.jobType);
    if (query.q) params.set("q", query.q);
    params.set("page", String(nextPage));
    return `/?${params.toString()}`;
  };

  return (
    <div className="space-y-8">
      <JobsFilters searchParams={searchParams} />

      <section className="rounded-xl border bg-card/85 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold text-muted-foreground">Categories:</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/govt-jobs">Govt Jobs</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/private-jobs">Private Jobs</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-[var(--font-heading)] text-2xl font-semibold">Latest Jobs (Mix of Both)</h2>
            <p className="text-sm text-muted-foreground">Total: {pagination.total}</p>
          </div>

          {items.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No jobs found</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Try different filters or check back after the next RSS sync.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {items.map((job) => (
                  <div key={job._id.toString()} className="animate-fade-in-up">
                    <JobCard
                      job={{
                        ...job,
                        _id: job._id.toString(),
                        publishedAt: job.publishedAt?.toISOString()
                      }}
                    />
                  </div>
                ))}
              </div>

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
            </>
          )}

          <AdSlot slot={adsense.slots.inContent} className="min-h-24" format="rectangle" />
        </div>

        <div className="space-y-4">
          <TrendingJobs
            jobs={trendingJobs.map((job) => ({
              _id: job._id.toString(),
              title: job.title,
              slug: job.slug,
              views: job.views || 0
            }))}
          />
          <AdSlot slot={adsense.slots.sidebar} className="min-h-56" format="rectangle" />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border bg-card/80 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-[var(--font-heading)] text-2xl font-semibold">Latest Blogs</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/blogs">View all</Link>
          </Button>
        </div>

        {blogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No blog content posted yet. Add content from the admin dashboard.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {blogs.map((blog) => (
              <Card key={String(blog._id)} className="border-border/80 bg-card/95">
                <CardHeader className="space-y-2">
                  <CardTitle className="line-clamp-2 text-lg">{blog.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">{new Date(blog.createdAt).toLocaleDateString("en-IN")}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="line-clamp-5 whitespace-pre-line text-sm text-muted-foreground">{blog.excerpt || blog.content}</p>
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/blogs/${blog.slug}`}>Read More</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border bg-card/80 p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <p className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Legal source only
            </p>
            <h1 className="font-[var(--font-heading)] text-3xl font-bold md:text-4xl">Job Access India</h1>
            <p className="max-w-2xl text-sm font-medium text-primary md:text-base">All Jobs. One Platform</p>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">Verified job updates from safe sources and admin-reviewed postings.</p>
            <SubscribeForm />
          </div>
          <AdSlot slot={adsense.slots.top} className="h-full min-h-28" format="horizontal" />
        </div>
      </section>
    </div>
  );
}
