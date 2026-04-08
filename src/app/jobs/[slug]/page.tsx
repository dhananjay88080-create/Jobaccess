import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Building2, CalendarClock, ExternalLink, GraduationCap, IndianRupee, MapPin } from "lucide-react";
import { getJobBySlug } from "@/lib/jobs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatSalaryRange } from "@/lib/utils";

interface JobPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const job = await getJobBySlug(params.slug, false);
  if (!job) {
    return {
      title: "Job Not Found"
    };
  }

  const title = `${job.title} | JobAccess`;
  const description = `${job.organization} recruitment. Qualification: ${job.qualification}. State: ${job.state}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article"
    },
    alternates: {
      canonical: `/jobs/${job.slug}`
    }
  };
}

export default async function JobDetailPage({ params }: JobPageProps) {
  const job = await getJobBySlug(params.slug, true);
  if (!job) {
    notFound();
  }
  const salary = formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryCurrency || "INR");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button asChild variant="ghost">
        <Link href="/" className="inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to jobs
        </Link>
      </Button>

      <Card className="border-border/70 bg-card/95">
        <CardHeader className="space-y-3">
          <Badge variant="secondary" className="w-fit">
            {job.category}
          </Badge>
          <Badge variant="outline" className="w-fit">
            {job.jobType === "private" ? "Private Job" : "Govt Job"}
          </Badge>
          <CardTitle className="font-[var(--font-heading)] text-2xl md:text-3xl">{job.title}</CardTitle>
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <p className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> {job.organization}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> {job.state}
            </p>
            <p className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" /> {job.qualification}
            </p>
            <p className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" /> Last Date:{" "}
              {job.lastDate ? format(new Date(job.lastDate), "dd MMM yyyy") : "Not specified"}
            </p>
            <p className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-primary" /> Salary: {salary}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <h2 className="font-semibold">Job Description</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{job.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <a href={job.applyLink} target="_blank" rel="noreferrer noopener">
                Apply Now
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Badge variant="outline">Source: {job.source}</Badge>
            <Badge variant="outline">Views: {job.views}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
