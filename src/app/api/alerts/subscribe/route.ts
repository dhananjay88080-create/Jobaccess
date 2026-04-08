import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { emailSubscriptionSchema } from "@/lib/validation";
import { connectToDatabase } from "@/lib/db";
import { SubscriberModel } from "@/models/Subscriber";

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, "alerts-subscribe", 15, 60_000);
  if (limited) return limited;

  const json = await request.json().catch(() => null);
  const parsed = emailSubscriptionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid email" }, { status: 400 });
  }

  await connectToDatabase();
  const subscriber = await SubscriberModel.findOneAndUpdate(
    { email: parsed.data.email.toLowerCase() },
    {
      isActive: true,
      email: parsed.data.email.toLowerCase(),
      alertPreference: parsed.data.alertPreference
    },
    { upsert: true, new: true }
  ).lean();

  return NextResponse.json({
    message: "Subscribed successfully",
    subscriberId: subscriber?._id,
    alertPreference: subscriber?.alertPreference || parsed.data.alertPreference
  });
}
