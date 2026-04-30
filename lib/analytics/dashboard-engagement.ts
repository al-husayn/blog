import { gte, sql } from 'drizzle-orm';
import { MONTH_DAYS } from '@/lib/analytics/constants';
import { getDb } from '@/lib/db/client';
import { articlePageViews } from '@/lib/db/schema';
import { buildSinceDate } from '@/lib/analytics/date';
import { calculateEngagementScore } from '@/lib/analytics/engagement';
import { roundToOneDecimal, toNumber } from '@/lib/analytics/number';
import type { DashboardAnalytics } from '@/types/analytics';

export const getEngagementSummary = async (
    now: Date,
): Promise<
    Pick<
        DashboardAnalytics,
        | 'avgEngagementSeconds30d'
        | 'engagementScore30d'
        | 'bounceRate30d'
        | 'avgScrollDepth30d'
        | 'scrollReach30d'
    >
> => {
    const db = getDb();
    const sinceDate = buildSinceDate(MONTH_DAYS, now);

    const [row] = await db
        .select({
            avgEngagementSeconds: sql<number>`coalesce(avg(${articlePageViews.engagedTimeSeconds}), 0)`,
            avgScrollDepth: sql<number>`coalesce(avg(${articlePageViews.maxScrollDepth}), 0)`,
            bounceRate: sql<number>`coalesce(avg(case when ${articlePageViews.didBounce} then 1 else 0 end), 0)`,
            reached50: sql<number>`coalesce(avg(case when ${articlePageViews.reached50} then 1 else 0 end), 0)`,
            reached75: sql<number>`coalesce(avg(case when ${articlePageViews.reached75} then 1 else 0 end), 0)`,
            reached100: sql<number>`coalesce(avg(case when ${articlePageViews.reached100} then 1 else 0 end), 0)`,
        })
        .from(articlePageViews)
        .where(gte(articlePageViews.createdAt, sinceDate));

    const avgEngagementSeconds30d = Math.round(toNumber(row?.avgEngagementSeconds));
    const bounceRate30d = roundToOneDecimal(toNumber(row?.bounceRate) * 100);
    const avgScrollDepth30d = roundToOneDecimal(toNumber(row?.avgScrollDepth));

    return {
        avgEngagementSeconds30d,
        engagementScore30d: calculateEngagementScore({
            avgEngagementSeconds: avgEngagementSeconds30d,
            avgScrollDepth: avgScrollDepth30d,
            bounceRate: bounceRate30d,
        }),
        bounceRate30d,
        avgScrollDepth30d,
        scrollReach30d: {
            reached50: roundToOneDecimal(toNumber(row?.reached50) * 100),
            reached75: roundToOneDecimal(toNumber(row?.reached75) * 100),
            reached100: roundToOneDecimal(toNumber(row?.reached100) * 100),
        },
    };
};
