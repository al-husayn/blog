import { roundToOneDecimal, toNumber } from '@/lib/analytics/number';
import type { CommentVelocityMap } from '@/lib/analytics/dashboard-comment-velocity';
import type { ReactionMaps } from '@/lib/analytics/dashboard-reactions';
import type { ArticleMetadata, ShareMetrics } from '@/lib/analytics/types';
import type { DashboardTopPostMetric } from '@/types/analytics';

export interface RecentPostMetrics {
    views30d: number;
    uniqueVisitors30d: number;
    avgEngagementSeconds: number;
    bounceRate: number;
}

export const buildRecentMetricsMap = (
    rows: Array<{
        articleSlug: string;
        views30d: number | string | bigint;
        uniqueVisitors30d: number | string | bigint;
        avgEngagementSeconds: number | string | bigint;
        bounceRate: number | string | bigint;
    }>,
): Map<string, RecentPostMetrics> =>
    new Map(
        rows.map((row) => [
            row.articleSlug,
            {
                views30d: toNumber(row.views30d),
                uniqueVisitors30d: toNumber(row.uniqueVisitors30d),
                avgEngagementSeconds: Math.round(toNumber(row.avgEngagementSeconds)),
                bounceRate: roundToOneDecimal(toNumber(row.bounceRate) * 100),
            },
        ]),
    );

const hasPostActivity = (metric: DashboardTopPostMetric): boolean =>
    metric.viewsAllTime > 0 ||
    metric.reactions > 0 ||
    metric.comments > 0 ||
    metric.shares30d > 0;

export const buildPostMetrics = ({
    candidateSlugs,
    metadataBySlug,
    recentMetricsBySlug,
    allTimeViewsBySlug,
    reactionMaps,
    shareMetrics,
    commentVelocityBySlug,
}: {
    candidateSlugs: Set<string>;
    metadataBySlug: Map<string, ArticleMetadata>;
    recentMetricsBySlug: Map<string, RecentPostMetrics>;
    allTimeViewsBySlug: Map<string, number>;
    reactionMaps: ReactionMaps;
    shareMetrics: ShareMetrics;
    commentVelocityBySlug: CommentVelocityMap;
}): DashboardTopPostMetric[] =>
    Array.from(candidateSlugs)
        .map((slug) => {
            const metadata = metadataBySlug.get(slug);
            const recentMetrics = recentMetricsBySlug.get(slug);
            const commentVelocity = commentVelocityBySlug.get(slug);

            return {
                slug,
                title: metadata?.title ?? slug,
                description: metadata?.description ?? 'Untitled article',
                publishedAt: metadata?.publishedAt ?? '',
                views30d: recentMetrics?.views30d ?? 0,
                viewsAllTime: allTimeViewsBySlug.get(slug) ?? 0,
                uniqueVisitors30d: recentMetrics?.uniqueVisitors30d ?? 0,
                avgEngagementSeconds: recentMetrics?.avgEngagementSeconds ?? 0,
                bounceRate: recentMetrics?.bounceRate ?? 0,
                reactions: reactionMaps.reactionsBySlug.get(slug) ?? 0,
                comments: reactionMaps.commentsBySlug.get(slug) ?? 0,
                shares30d: shareMetrics.shares30dBySlug.get(slug) ?? 0,
                comments48h: commentVelocity?.comments48h ?? 0,
                commentsVelocityPerHour: commentVelocity?.commentsVelocityPerHour ?? 0,
            };
        })
        .filter(hasPostActivity);

export const byRecentViews = (
    left: DashboardTopPostMetric,
    right: DashboardTopPostMetric,
): number => right.views30d - left.views30d || right.viewsAllTime - left.viewsAllTime;

export const byAllTimeViews = (
    left: DashboardTopPostMetric,
    right: DashboardTopPostMetric,
): number => right.viewsAllTime - left.viewsAllTime || right.views30d - left.views30d;

export const getTotalInteractions = ({
    candidateSlugs,
    reactionMaps,
    shareMetrics,
}: {
    candidateSlugs: Set<string>;
    reactionMaps: ReactionMaps;
    shareMetrics: ShareMetrics;
}): number => {
    let total = 0;

    for (const slug of candidateSlugs) {
        total += reactionMaps.commentsBySlug.get(slug) ?? 0;
        total += reactionMaps.reactionsBySlug.get(slug) ?? 0;
        total += shareMetrics.sharesAllTimeBySlug.get(slug) ?? 0;
    }

    return total;
};
