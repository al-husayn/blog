export type TrafficSourceGroup = 'direct' | 'organic' | 'social' | 'referral';

export type ShareNetwork =
    | 'x'
    | 'linkedin'
    | 'facebook'
    | 'whatsapp'
    | 'native'
    | 'copy_link';

export interface AnalyticsPageViewInput {
    pageViewId: string;
    articleSlug: string;
    path: string;
    visitorId: string;
    sessionId: string;
    referrer?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
}

export interface AnalyticsPageViewCompletionInput {
    pageViewId: string;
    engagedTimeSeconds: number;
    maxScrollDepth: number;
    reached50: boolean;
    reached75: boolean;
    reached100: boolean;
}

export interface AnalyticsShareEventInput {
    articleSlug: string;
    visitorId: string;
    sessionId: string;
    network: ShareNetwork;
}

export interface AnalyticsTimeseriesPoint {
    date: string;
    label: string;
    value: number;
}

export interface DashboardPeriodMetric {
    label: string;
    days: number | null;
    views: number;
    uniqueVisitors: number;
    trend: AnalyticsTimeseriesPoint[];
}

export interface DashboardSourceDetail {
    label: string;
    value: number;
}

export interface DashboardSourceSlice {
    key: TrafficSourceGroup;
    label: string;
    value: number;
    details: DashboardSourceDetail[];
}

export interface DashboardKeywordMetric {
    keyword: string;
    visits: number;
}

export interface DashboardTopPostMetric {
    slug: string;
    title: string;
    description: string;
    publishedAt: string;
    views30d: number;
    viewsAllTime: number;
    uniqueVisitors30d: number;
    avgEngagementSeconds: number;
    bounceRate: number;
    reactions: number;
    comments: number;
    shares30d: number;
    comments48h: number;
    commentsVelocityPerHour: number;
}

export interface DashboardNewReturningMetric {
    newVisitors: number;
    returningVisitors: number;
    total: number;
}

export interface DashboardShareMetric {
    network: ShareNetwork;
    label: string;
    value: number;
}

export interface DashboardAnalytics {
    generatedAt: string;
    periods: DashboardPeriodMetric[];
    views30d: number;
    viewsDeltaVsPrevious30d: number | null;
    pageviewSparkline: AnalyticsTimeseriesPoint[];
    uniqueVisitors30d: number;
    uniqueVisitorsAllTime: number;
    topPosts: DashboardTopPostMetric[];
    topPostsAllTime: DashboardTopPostMetric[];
    sources30d: DashboardSourceSlice[];
    organicTrend90d: AnalyticsTimeseriesPoint[];
    topKeywords90d: DashboardKeywordMetric[];
    avgEngagementSeconds30d: number;
    engagementScore30d: number;
    bounceRate30d: number;
    avgScrollDepth30d: number;
    scrollReach30d: {
        reached50: number;
        reached75: number;
        reached100: number;
    };
    newVsReturning30d: DashboardNewReturningMetric;
    shareBreakdown30d: DashboardShareMetric[];
    totalShares30d: number;
    totalReactionsAllTime: number;
    avgInteractionsPerPost: number;
}
