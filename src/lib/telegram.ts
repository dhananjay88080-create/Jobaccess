import { env } from "@/lib/env";

export async function sendTelegramJobNotification(message: string) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return { sent: false, reason: "Telegram environment variables are missing" };
  }

  const endpoint = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text: message,
      disable_web_page_preview: false
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Telegram send failed: ${text}`);
  }

  return { sent: true };
}
