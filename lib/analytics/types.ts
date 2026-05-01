import type { DashboardShareMetric, TrafficSourceGroup } from '@/types/analytics';

export interface DerivedTrafficSource {
    group: TrafficSourceGroup;
    detail: string;
    referrerHost: string | null;
    keyword: string | null;
}

export interface ArticleMetadata {
    slug: string;
    title: string;
    description: string;
    publishedAt: string;
    publishedDate: Date | null;
}

export interface ShareMetrics {
    shareBreakdown30d: DashboardShareMetric[];
    totalShares30d: number;
    shares30dBySlug: Map<string, number>;
    sharesAllTimeBySlug: Map<string, number>;
}
