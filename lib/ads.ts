export type AdSize = "small" | "medium" | "large" | "leaderboard";

export type AdPlacement =
  | "home-top"
  | "home-bottom"
  | "article-inline"
  | "article-sidebar";

interface AdPlacementConfig {
  size: AdSize;
  title: string;
  description: string;
}

export interface AdsRuntimeConfig {
  placeholdersEnabled: boolean;
  adsenseEnabled: boolean;
  adsenseClientId: string;
}

const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
};

const placementConfigMap: Record<AdPlacement, AdPlacementConfig> = {
  "home-top": {
    size: "leaderboard",
    title: "Sponsored",
    description: "Advertisement space for developer tools, courses, and events.",
  },
  "home-bottom": {
    size: "medium",
    title: "Advertisement",
    description: "Showcase your product to engineers reading this blog.",
  },
  "article-inline": {
    size: "leaderboard",
    title: "Sponsored",
    description: "Relevant tools and resources for this topic.",
  },
  "article-sidebar": {
    size: "medium",
    title: "Advertisement",
    description: "Sponsor this slot and reach frontend and AI developers.",
  },
};

const adsenseSlotByPlacement: Record<AdPlacement, string | undefined> = {
  "home-top": process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP,
  "home-bottom": process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_BOTTOM,
  "article-inline": process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_INLINE,
  "article-sidebar": process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_SIDEBAR,
};

export const getAdsRuntimeConfig = (): AdsRuntimeConfig => {
  return {
    placeholdersEnabled: toBoolean(
      process.env.NEXT_PUBLIC_ENABLE_AD_PLACEHOLDERS,
      true
    ),
    adsenseEnabled: toBoolean(process.env.NEXT_PUBLIC_ENABLE_ADSENSE, false),
    adsenseClientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || "",
  };
};

export const getAdPlacementConfig = (placement: AdPlacement): AdPlacementConfig => {
  return placementConfigMap[placement];
};

export const getAdsenseSlotId = (placement: AdPlacement): string | null => {
  const slot = adsenseSlotByPlacement[placement]?.trim();
  return slot && slot.length > 0 ? slot : null;
};
