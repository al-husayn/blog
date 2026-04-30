import { DASHBOARD_MONTHS, MONTH_DAYS, QUARTER_DAYS, WEEK_DAYS } from '@/lib/analytics/constants';
import { getNewVsReturningVisitors } from '@/lib/analytics/dashboard-audience';
import { getEngagementSummary } from '@/lib/analytics/dashboard-engagement';
import { getPeriodTotals, getPreviousThirtyDayViews } from '@/lib/analytics/dashboard-periods';
import { getTopPosts } from '@/lib/analytics/dashboard-posts';
import { getDailyViewsSeries, getMonthlyViewsSeries } from '@/lib/analytics/dashboard-series';
import { getShareMetrics } from '@/lib/analytics/dashboard-shares';
import { getSourceBreakdown, getTopKeywords } from '@/lib/analytics/dashboard-sources';
import { getGrowthDelta } from '@/lib/analytics/number';
import type { AnalyticsTimeseriesPoint, DashboardAnalytics } from '@/types/analytics';

export const getDashboardAnalytics = async (): Promise<DashboardAnalytics> => {
    const now = new Date();
    const [
        trend7d,
        trend30d,
        trend90d,
        trendAllTime,
        previousThirtyDayViews,
        sources30d,
        organicTrend90d,
        topKeywords90d,
        engagementSummary,
        newVsReturning30d,
        shareMetrics,
        topPostMetrics,
    ] = await Promise.all([
        getDailyViewsSeries({ days: WEEK_DAYS, now }),
        getDailyViewsSeries({ days: MONTH_DAYS, now }),
        getDailyViewsSeries({ days: QUARTER_DAYS, now }),
        getMonthlyViewsSeries({ months: DASHBOARD_MONTHS, now }),
        getPreviousThirtyDayViews(now),
        getSourceBreakdown(now),
        getDailyViewsSeries({ days: QUARTER_DAYS, now, sourceGroup: 'organic' }),
        getTopKeywords(now),
        getEngagementSummary(now),
        getNewVsReturningVisitors(now),
        getShareMetrics(now),
        getTopPosts(now),
    ]);
    const pageviewSparkline = trend30d;

    const periods = await getPeriodTotals(
        now,
        new Map<string, AnalyticsTimeseriesPoint[]>([
            ['7d', trend7d],
            ['30d', trend30d],
            ['90d', trend90d],
            ['All-time', trendAllTime],
        ]),
    );
    const thirtyDayMetric = periods.find((period) => period.days === MONTH_DAYS);
    const allTimeMetric = periods.find((period) => period.days === null);
    const views30d = thirtyDayMetric?.views ?? 0;

    return {
        generatedAt: now.toISOString(),
        periods,
        views30d,
        viewsDeltaVsPrevious30d: getGrowthDelta(views30d, previousThirtyDayViews),
        pageviewSparkline,
        uniqueVisitors30d: thirtyDayMetric?.uniqueVisitors ?? 0,
        uniqueVisitorsAllTime: allTimeMetric?.uniqueVisitors ?? 0,
        topPosts: topPostMetrics.topPosts,
        topPostsAllTime: topPostMetrics.topPostsAllTime,
        sources30d,
        organicTrend90d,
        topKeywords90d,
        avgEngagementSeconds30d: engagementSummary.avgEngagementSeconds30d,
        engagementScore30d: engagementSummary.engagementScore30d,
        bounceRate30d: engagementSummary.bounceRate30d,
        avgScrollDepth30d: engagementSummary.avgScrollDepth30d,
        scrollReach30d: engagementSummary.scrollReach30d,
        newVsReturning30d,
        shareBreakdown30d: shareMetrics.shareBreakdown30d,
        totalShares30d: shareMetrics.totalShares30d,
        totalReactionsAllTime: topPostMetrics.totalReactionsAllTime,
        avgInteractionsPerPost: topPostMetrics.avgInteractionsPerPost,
    };
};
