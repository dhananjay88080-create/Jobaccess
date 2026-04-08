import { NextRequest, NextResponse } from "next/server";

interface Entry {
  count: number;
  resetAt: number;
}

const bucket = new Map<string, Entry>();

function getIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return "unknown";
}

export function enforceRateLimit(
  request: NextRequest,
  key: string,
  limit = 100,
  windowMs = 60_000
): NextResponse | null {
  const ip = getIp(request);
  const now = Date.now();
  const requestKey = `${key}:${ip}`;

  const existing = bucket.get(requestKey);
  if (!existing || existing.resetAt < now) {
    bucket.set(requestKey, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (existing.count >= limit) {
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
    return NextResponse.json(
      {
        message: "Too many requests. Please try again later."
      },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) }
      }
    );
  }

  existing.count += 1;
  bucket.set(requestKey, existing);
  return null;
}
