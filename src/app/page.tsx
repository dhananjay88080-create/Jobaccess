import Link from "next/link";
import { AdSlot } from "@/components/ads/ad-slot";
import { JobCard } from "@/components/jobs/job-card";
import { JobsFilters } from "@/components/jobs/jobs-filters";
import { SubscribeForm } from "@/components/jobs/subscribe-form";
import { TrendingJobs } from "@/components/jobs/trending-jobs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listJobs, getTrendingJobs } from "@/lib/jobs";
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
    category: typeof searchParams.category === "string" ? searchParams.category : undefined,
    state: typeof searchParams.state === "string" ? searchParams.state : undefined,
    qualification: typeof searchParams.qualification === "string" ? searchParams.qualification : undefined,
    q: typeof searchParams.q === "string" ? searchParams.q : undefined,
    status: "published" as const
  };

  const [{ items, pagination }, trendingJobs] = await Promise.all([listJobs(query), getTrendingJobs(6)]);

  const buildPageLink = (nextPage: number) => {
    const params = new URLSearchParams();
    if (query.jobType) params.set("jobType", query.jobType);
    if (query.category) params.set("category", query.category);
    if (query.state) params.set("state", query.state);
    if (query.qualification) params.set("qualification", query.qualification);
    if (query.q) params.set("q", query.q);
    params.set("page", String(nextPage));
    return `/?${params.toString()}`;
  };

  return (
    <div className="space-y-8">
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

      <section className="rounded-xl border bg-card/85 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold text-muted-foreground">Categories:</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/govt-jobs">Govt Jobs</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/private-jobs">Private Jobs</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/results">Results</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admit-cards">Admit Cards</Link>
          </Button>
        </div>
      </section>

      <JobsFilters searchParams={searchParams} />

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
    </div>
  );
}
