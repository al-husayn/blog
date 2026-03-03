"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

interface AdsenseSlotProps {
  clientId: string;
  slotId: string;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}

export function AdsenseSlot({
  clientId,
  slotId,
  className,
  style,
  ariaLabel = "Advertisement",
}: AdsenseSlotProps) {
  const slotInstanceKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const instanceKey = `${clientId}:${slotId}`;
    if (slotInstanceKeyRef.current === instanceKey) {
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      slotInstanceKeyRef.current = instanceKey;
    } catch (error) {
      console.error("AdSense slot push failed:", error);
    }
  }, [clientId, slotId]);

  return (
    <aside
      aria-label={ariaLabel}
      className={cn(
        "rounded-lg border border-border/60 bg-muted/10 overflow-hidden px-2",
        className
      )}
    >
      <ins
        className="adsbygoogle block"
        style={style}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
