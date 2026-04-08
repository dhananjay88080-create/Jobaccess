import type { MetadataRoute } from "next";
import { connectToDatabase } from "@/lib/db";
import { JobModel } from "@/models/Job";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  await connectToDatabase();
  const jobs = await JobModel.find({ status: "published" })
    .sort({ updatedAt: -1 })
    .limit(5000)
    .select("slug updatedAt")
    .lean();

  const jobPages = jobs.map((job) => ({
    url: `${baseUrl}/jobs/${job.slug}`,
    lastModified: job.updatedAt || new Date(),
    changeFrequency: "hourly" as const,
    priority: 0.8
  }));

  const staticPages = [
    { url: `${baseUrl}/govt-jobs`, priority: 0.8 },
    { url: `${baseUrl}/private-jobs`, priority: 0.8 },
    { url: `${baseUrl}/results`, priority: 0.5 },
    { url: `${baseUrl}/admit-cards`, priority: 0.5 },
    { url: `${baseUrl}/about-us`, priority: 0.6 },
    { url: `${baseUrl}/contact-us`, priority: 0.6 },
    { url: `${baseUrl}/privacy-policy`, priority: 0.4 },
    { url: `${baseUrl}/disclaimer`, priority: 0.4 },
    { url: `${baseUrl}/terms-and-conditions`, priority: 0.4 }
  ].map((page) => ({
    ...page,
    lastModified: new Date(),
    changeFrequency: "monthly" as const
  }));

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1
    },
    ...staticPages,
    ...jobPages
  ];
}
