import { count, gte, sql } from 'drizzle-orm';
import { MONTH_DAYS, TOP_POST_LIMIT } from '@/lib/analytics/constants';
import { getArticleMetadataMap } from '@/lib/analytics/article-metadata';
import { getDb } from '@/lib/db/client';
import { articlePageViews } from '@/lib/db/schema';
import { getCommentVelocityMap } from '@/lib/analytics/dashboard-comment-velocity';
import {
    buildPostMetrics,
    buildRecentMetricsMap,
    byAllTimeViews,
    byRecentViews,
    getTotalInteractions,
} from '@/lib/analytics/dashboard-post-metrics';
import { getReactionMaps, toSlugCountMap } from '@/lib/analytics/dashboard-reactions';
import { getShareMetrics } from '@/lib/analytics/dashboard-shares';
import { buildSinceDate } from '@/lib/analytics/date';
import { roundToOneDecimal } from '@/lib/analytics/number';
import type { DashboardTopPostMetric } from '@/types/analytics';

interface TopPostMetrics {
    topPosts: DashboardTopPostMetric[];
    topPostsAllTime: DashboardTopPostMetric[];
    totalReactionsAllTime: number;
    avgInteractionsPerPost: number;
}

const getRecentPageViewRows = (sinceDate: Date) =>
    getDb()
        .select({
            articleSlug: articlePageViews.articleSlug,
            views30d: count(),
            uniqueVisitors30d: sql<number>`count(distinct ${articlePageViews.visitorId})`,
            avgEngagementSeconds: sql<number>`coalesce(avg(${articlePageViews.engagedTimeSeconds}), 0)`,
            bounceRate: sql<number>`coalesce(avg(case when ${articlePageViews.didBounce} then 1 else 0 end), 0)`,
        })
        .from(articlePageViews)
        .where(gte(articlePageViews.createdAt, sinceDate))
        .groupBy(articlePageViews.articleSlug);

const getAllTimePageViewRows = () =>
    getDb()
        .select({
            articleSlug: articlePageViews.articleSlug,
            value: count(),
        })
        .from(articlePageViews)
        .groupBy(articlePageViews.articleSlug);

const getCandidateSlugs = ({
    allTimeViewsBySlug,
    recentMetricsBySlug,
    metadataBySlug,
}: {
    allTimeViewsBySlug: Map<string, number>;
    recentMetricsBySlug: Map<string, unknown>;
    metadataBySlug: Map<string, unknown>;
}): Set<string> =>
    new Set([
        ...allTimeViewsBySlug.keys(),
        ...recentMetricsBySlug.keys(),
        ...metadataBySlug.keys(),
    ]);

export const getTopPosts = async (now: Date): Promise<TopPostMetrics> => {
    const sinceDate = buildSinceDate(MONTH_DAYS, now);
    const metadataBySlug = getArticleMetadataMap();

    const [recentRows, allTimeRows, shareMetrics, reactionMaps, commentVelocityBySlug] =
        await Promise.all([
            getRecentPageViewRows(sinceDate),
            getAllTimePageViewRows(),
            getShareMetrics(now),
            getReactionMaps(),
            getCommentVelocityMap(metadataBySlug),
        ]);

    const recentMetricsBySlug = buildRecentMetricsMap(recentRows);
    const allTimeViewsBySlug = toSlugCountMap(allTimeRows);
    const candidateSlugs = getCandidateSlugs({
        allTimeViewsBySlug,
        recentMetricsBySlug,
        metadataBySlug,
    });
    const postMetrics = buildPostMetrics({
        candidateSlugs,
        metadataBySlug,
        recentMetricsBySlug,
        allTimeViewsBySlug,
        reactionMaps,
        shareMetrics,
        commentVelocityBySlug,
    });
    const totalReactionsAllTime = getTotalInteractions({
        candidateSlugs,
        reactionMaps,
        shareMetrics,
    });

    return {
        topPosts: [...postMetrics].sort(byRecentViews).slice(0, TOP_POST_LIMIT),
        topPostsAllTime: [...postMetrics].sort(byAllTimeViews).slice(0, TOP_POST_LIMIT),
        totalReactionsAllTime,
        avgInteractionsPerPost:
            candidateSlugs.size === 0
                ? 0
                : roundToOneDecimal(totalReactionsAllTime / candidateSlugs.size),
    };
};
