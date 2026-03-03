import type { CSSProperties } from "react";
import { AdsPlaceholder } from "@/components/ads-placeholder";
import { AdsenseSlot } from "@/components/adsense-slot";
import {
  getAdPlacementConfig,
  getAdsRuntimeConfig,
  getAdsenseSlotId,
  type AdPlacement,
  type AdSize,
} from "@/lib/ads";
import { cn } from "@/lib/utils";

interface AdUnitProps {
  placement: AdPlacement;
  className?: string;
}

const adSizeClassMap: Record<AdSize, string> = {
  small: "min-h-[100px]",
  medium: "min-h-[250px]",
  large: "min-h-[280px]",
  leaderboard: "min-h-[90px]",
};

const adSizeStyleMap: Record<AdSize, CSSProperties> = {
  small: { display: "block", width: "100%", minHeight: 100 },
  medium: { display: "block", width: "100%", minHeight: 250 },
  large: { display: "block", width: "100%", minHeight: 280 },
  leaderboard: { display: "block", width: "100%", minHeight: 90 },
};

export function AdUnit({ placement, className }: AdUnitProps) {
  const placementConfig = getAdPlacementConfig(placement);
  const runtimeConfig = getAdsRuntimeConfig();
  const adsenseSlotId = getAdsenseSlotId(placement);

  if (
    runtimeConfig.adsenseEnabled &&
    runtimeConfig.adsenseClientId &&
    adsenseSlotId
  ) {
    return (
      <AdsenseSlot
        clientId={runtimeConfig.adsenseClientId}
        slotId={adsenseSlotId}
        className={cn(adSizeClassMap[placementConfig.size], className)}
        style={adSizeStyleMap[placementConfig.size]}
        ariaLabel={`${placementConfig.title} (${placement})`}
      />
    );
  }

  if (!runtimeConfig.placeholdersEnabled) {
    return null;
  }

  return (
    <AdsPlaceholder
      size={placementConfig.size}
      title={placementConfig.title}
      description={placementConfig.description}
      slot={placement}
      className={className}
    />
  );
}
