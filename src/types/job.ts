export type JobStatus = "pending" | "published" | "rejected";

export interface JobDTO {
  _id: string;
  title: string;
  slug: string;
  description: string;
  organization: string;
  category: string;
  jobType: "government" | "private";
  state: string;
  qualification: string;
  lastDate?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  applyLink: string;
  source: string;
  sourceType: "rss" | "api" | "manual" | "html";
  sourceUid: string;
  publishedAt?: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  views: number;
}
