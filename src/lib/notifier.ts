import { sendJobAlertEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { sendTelegramJobNotification } from "@/lib/telegram";

interface PublishedJobPayload {
  title: string;
  organization: string;
  applyLink: string;
  slug: string;
  jobType: "government" | "private";
}

export async function notifyOnPublishedJob(job: PublishedJobPayload) {
  const publicUrl = `${env.APP_URL.replace(/\/$/, "")}/jobs/${job.slug}`;
  const label = job.jobType === "private" ? "Private Job" : "Government Job";

  const message = `
🚀 New ${label} Published


📌 Position: ${job.title}
🏢 Organization: ${job.organization}
📂 Category: ${label}

🔗 Apply Now: ${job.applyLink}

📄 Full Details: ${publicUrl}
`;

  const emailHTML = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #2c3e50;">🚀 New ${label} Published</h2>
    
    <p><strong>📌 Position:</strong> ${job.title}</p>
    <p><strong>🏢 Organization:</strong> ${job.organization}</p>
    <p><strong>📂 Category:</strong> ${label}</p>

    <p style="margin-top: 15px;">
      <a href="${job.applyLink}" style="background: #28a745; color: #fff; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
        Apply Now
      </a>
    </p>

    <p style="margin-top: 10px;">
      <a href="${publicUrl}" style="color: #007bff;">
        View Full Details
      </a>
    </p>

    <hr style="margin: 20px 0;" />
    <p style="font-size: 12px; color: #777;">You're receiving this because you subscribed to job alerts.</p>
  </div>
  `;

  const tasks = [
    sendTelegramJobNotification(message).catch(() => ({ sent: false })),
    sendJobAlertEmail(
      `🚀 New ${label}: ${job.title}`,
      emailHTML,
      job.jobType
    ).catch(() => ({ sent: false }))
  ];

  return Promise.all(tasks);
}