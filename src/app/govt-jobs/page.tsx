import Link from "next/link";
import { JobCard } from "@/components/jobs/job-card";
import { JobsFilters } from "@/components/jobs/jobs-filters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listJobs } from "@/lib/jobs";

interface GovtJobsPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function GovtJobsPage({ searchParams }: GovtJobsPageProps) {
  const page = Number(searchParams.page || "1");
  const query = {
    page: Number.isNaN(page) || page < 1 ? 1 : page,
    limit: 12,
    q: typeof searchParams.q === "string" ? searchParams.q : undefined,
    status: "published" as const,
    jobType: "government" as const
  };

  const { items, pagination } = await listJobs(query);

  const buildPageLink = (nextPage: number) => {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    params.set("page", String(nextPage));
    return `/govt-jobs?${params.toString()}`;
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border bg-card/80 p-6 shadow-sm">
        <h1 className="font-[var(--font-heading)] text-3xl font-bold">Govt Jobs</h1>
        <p className="mt-2 text-sm text-muted-foreground">Latest verified government job postings.</p>
      </section>

      <JobsFilters searchParams={searchParams} showJobType={false} />

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-[var(--font-heading)] text-2xl font-semibold">Government Jobs</h2>
          <p className="text-sm text-muted-foreground">Total: {pagination.total}</p>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No govt jobs found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Try different filters or check back after the next sync.</p>
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
      </section>
    </div>
  );
}
