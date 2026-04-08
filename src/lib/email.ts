import nodemailer from "nodemailer";
import { FilterQuery } from "mongoose";
import { env } from "@/lib/env";
import { SubscriberModel } from "@/models/Subscriber";
import { connectToDatabase } from "@/lib/db";
import type { SubscriberDocument } from "@/models/Subscriber";

function getTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: Number(env.SMTP_PORT) === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });
}

export async function sendJobAlertEmail(
  subject: string,
  html: string,
  jobType?: "government" | "private"
) {
  const transporter = getTransporter();
  if (!transporter || !env.SMTP_FROM) {
    return { sent: false, reason: "Email transport is not configured" };
  }

  await connectToDatabase();
  const query: FilterQuery<SubscriberDocument> = { isActive: true };
  if (jobType) {
    query.$or = [
      { alertPreference: "all" },
      { alertPreference: jobType },
      { alertPreference: { $exists: false } }
    ];
  }

  const subscribers = await SubscriberModel.find(query).lean();
  if (!subscribers.length) {
    return { sent: false, reason: "No active subscribers" };
  }

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: env.SMTP_FROM,
    bcc: subscribers.map((sub) => sub.email),
    subject,
    html
  });

  return { sent: true, count: subscribers.length };
}
