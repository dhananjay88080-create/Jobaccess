"use client";

import { useEffect, useRef } from "react";
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
  const adRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    if (!slot || !hasAdSenseConfig()) return;

    try {
      const adElement = adRef.current;
      if (!adElement) return;

      const alreadyLoaded =
        adElement.getAttribute("data-adsbygoogle-status") === "done" ||
        adElement.dataset.adLoaded === "true";
      if (alreadyLoaded) return;

      const adsQueue = window.adsbygoogle || [];
      adsQueue.push({});
      window.adsbygoogle = adsQueue;
      adElement.dataset.adLoaded = "true";
    } catch {
      // Ignore ad rendering errors in development.
    }
  }, [slot, format]);

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
      ref={adRef}
      className={cn("adsbygoogle block rounded-lg border bg-card", className)}
      style={{ display: "block" }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
