import Link from "next/link";
import { format } from "date-fns";
import { Building2, CalendarClock, GraduationCap, IndianRupee, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatSalaryRange } from "@/lib/utils";

interface JobCardProps {
  job: {
    _id: string;
    title: string;
    slug: string;
    description: string;
    organization: string;
    category: string;
    jobType?: "government" | "private";
    qualification: string;
    state: string;
    lastDate?: Date | string;
    rssRawPublishedAt?: Date | string;
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency?: string;
    publishedAt?: Date | string;
  };
}

export function JobCard({ job }: JobCardProps) {
  const parsedLastDate = job.lastDate ? new Date(job.lastDate) : null;
  const hasValidLastDate = Boolean(parsedLastDate && !Number.isNaN(parsedLastDate.getTime()));
  const parsedPublishedAt = job.publishedAt ? new Date(job.publishedAt) : null;
  const hasValidPublishedAt = Boolean(parsedPublishedAt && !Number.isNaN(parsedPublishedAt.getTime()));

  const publishedAt = hasValidPublishedAt && parsedPublishedAt ? format(parsedPublishedAt, "dd MMM yyyy") : null;
  const lastDate = hasValidLastDate && parsedLastDate
    ? format(parsedLastDate, "dd MMM yyyy")
    : job.jobType === "government" && publishedAt
      ? `Check official notice (posted ${publishedAt})`
      : "Not specified";
  const salary = formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryCurrency || "INR");

  return (
    <Card className="group h-full border-border/80 bg-card/95 transition hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{job.category}</Badge>
            <Badge variant="outline">{job.jobType === "private" ? "Private Job" : "Govt Job"}</Badge>
          </div>
          {publishedAt ? <span className="text-xs text-muted-foreground">Published {publishedAt}</span> : null}
        </div>
        <CardTitle className="line-clamp-2 text-lg group-hover:text-primary">{job.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">{job.description}</p>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4 text-primary" /> {job.organization}
        </p>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" /> {job.state}
        </p>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <GraduationCap className="h-4 w-4 text-primary" /> {job.qualification}
        </p>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarClock className="h-4 w-4 text-primary" /> Last Date: {lastDate}
        </p>
        {job.jobType === "private" ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <IndianRupee className="h-4 w-4 text-primary" /> Salary: {salary}
          </p>
        ) : null}
        <Button asChild className="mt-2 w-full">
          <Link href={`/jobs/${job.slug}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
