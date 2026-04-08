import Link from "next/link";
import { Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TrendingJobsProps {
  jobs: Array<{
    _id: string;
    title: string;
    slug: string;
    views: number;
  }>;
}

export function TrendingJobs({ jobs }: TrendingJobsProps) {
  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="h-4 w-4 text-primary" /> Trending Jobs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No trending jobs yet.</p>
        ) : (
          jobs.map((job) => (
            <div key={job._id} className="rounded-lg border border-border/60 p-3">
              <Link href={`/jobs/${job.slug}`} className="line-clamp-2 text-sm font-medium hover:text-primary">
                {job.title}
              </Link>
              <Badge variant="outline" className="mt-2">
                {job.views} views
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
