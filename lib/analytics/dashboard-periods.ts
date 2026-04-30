import { and, count, gte, lt, sql } from 'drizzle-orm';
import { MONTH_DAYS, PERIODS } from '@/lib/analytics/constants';
import { getDb } from '@/lib/db/client';
import { articlePageViews } from '@/lib/db/schema';
import { buildSinceDate } from '@/lib/analytics/date';
import { toNumber } from '@/lib/analytics/number';
import type { AnalyticsTimeseriesPoint, DashboardPeriodMetric } from '@/types/analytics';

export const getPeriodTotals = async (
    now: Date,
    periodTrends: Map<string, AnalyticsTimeseriesPoint[]>,
): Promise<DashboardPeriodMetric[]> => {
    const db = getDb();

    return Promise.all(
        PERIODS.map(async (period) => {
            const baseQuery = db
                .select({
                    views: count(),
                    uniqueVisitors: sql<number>`count(distinct ${articlePageViews.visitorId})`,
                })
                .from(articlePageViews);

            const [row] =
                period.days === null
                    ? await baseQuery
                    : await baseQuery.where(
                          gte(articlePageViews.createdAt, buildSinceDate(period.days, now)),
                      );

            return {
                label: period.label,
                days: period.days,
                views: toNumber(row?.views),
                uniqueVisitors: toNumber(row?.uniqueVisitors),
                trend: periodTrends.get(period.label) ?? [],
            };
        }),
    );
};

export const getPreviousThirtyDayViews = async (now: Date): Promise<number> => {
    const db = getDb();
    const currentWindowStart = buildSinceDate(MONTH_DAYS, now);
    const previousWindowStart = buildSinceDate(MONTH_DAYS * 2, now);

    const [row] = await db
        .select({ views: count() })
        .from(articlePageViews)
        .where(
            and(
                gte(articlePageViews.createdAt, previousWindowStart),
                lt(articlePageViews.createdAt, currentWindowStart),
            ),
        );

    return toNumber(row?.views);
};
