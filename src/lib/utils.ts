import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeText(value: string, maxLength = 6000) {
  const cleaned = value
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return cleaned.slice(0, maxLength);
}

export function formatSalaryRange(salaryMin?: number, salaryMax?: number, salaryCurrency = "INR") {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: salaryCurrency,
    maximumFractionDigits: 0
  });

  if (salaryMin !== undefined && salaryMax !== undefined) {
    return `${formatter.format(salaryMin)} - ${formatter.format(salaryMax)}`;
  }
  if (salaryMin !== undefined) {
    return `From ${formatter.format(salaryMin)}`;
  }
  if (salaryMax !== undefined) {
    return `Up to ${formatter.format(salaryMax)}`;
  }
  return "Not specified";
}

export function toSentenceCase(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}
