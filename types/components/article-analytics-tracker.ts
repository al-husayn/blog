export interface ArticleAnalyticsTrackerProps {
    articleSlug: string;
    path: string;
}

export interface TrackerState {
    pageViewId: string;
    engagedMs: number;
    lastTickAt: number;
    lastInteractionAt: number;
    maxScrollDepth: number;
    reached50: boolean;
    reached75: boolean;
    reached100: boolean;
    finalized: boolean;
}
