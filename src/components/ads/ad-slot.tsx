"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { hasAdSenseConfig } from "@/lib/adsense";

interface AdSlotProps {
  slot?: string;
  className?: string;
  format?: "auto" | "rectangle" | "horizontal";
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export function AdSlot({ slot, className, format = "auto" }: AdSlotProps) {
  useEffect(() => {
    if (!slot || !hasAdSenseConfig()) return;

    try {
      const adsQueue = window.adsbygoogle || [];
      adsQueue.push({});
      window.adsbygoogle = adsQueue;
    } catch {
      // Ignore ad rendering errors in development.
    }
  }, [slot]);

  if (!slot || !hasAdSenseConfig()) {
    return (
      <div
        className={cn(
          "flex h-24 items-center justify-center rounded-lg border border-dashed bg-muted/35 text-xs text-muted-foreground",
          className
        )}
      >
        Ad Slot Placeholder ({format})
      </div>
    );
  }

  return (
    <ins
      className={cn("adsbygoogle block rounded-lg border bg-card", className)}
      style={{ display: "block" }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
