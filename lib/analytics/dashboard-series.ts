import { and, count, eq, gte, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { articlePageViews } from '@/lib/db/schema';
import {
    buildFilledDailySeries,
    buildFilledMonthlySeries,
    buildSinceDate,
    startOfUtcMonth,
    subtractMonths,
} from '@/lib/analytics/date';
import type { AnalyticsTimeseriesPoint, TrafficSourceGroup } from '@/types/analytics';

export const getDailyViewsSeries = async ({
    days,
    now,
    sourceGroup,
}: {
    days: number;
    now: Date;
    sourceGroup?: TrafficSourceGroup;
}): Promise<AnalyticsTimeseriesPoint[]> => {
    const db = getDb();
    const sinceDate = buildSinceDate(days, now);
    const dayBucket = sql<string>`to_char(date_trunc('day', ${articlePageViews.createdAt} AT TIME ZONE 'UTC'), 'YYYY-MM-DD')`;
    const bucketPosition = sql.raw('1');
    const dateFilter = gte(articlePageViews.createdAt, sinceDate);

    const rows = await db
        .select({
            day: dayBucket,
            value: count(),
        })
        .from(articlePageViews)
        .where(
            sourceGroup
                ? and(dateFilter, eq(articlePageViews.sourceGroup, sourceGroup))
                : dateFilter,
        )
        .groupBy(bucketPosition)
        .orderBy(bucketPosition);

    return buildFilledDailySeries(rows, days, now);
};

export const getMonthlyViewsSeries = async ({
    months,
    now,
}: {
    months: number;
    now: Date;
}): Promise<AnalyticsTimeseriesPoint[]> => {
    const db = getDb();
    const sinceDate = startOfUtcMonth(subtractMonths(now, months - 1));
    const monthBucket = sql<string>`to_char(date_trunc('month', ${articlePageViews.createdAt} AT TIME ZONE 'UTC'), 'YYYY-MM')`;
    const bucketPosition = sql.raw('1');

    const rows = await db
        .select({
            month: monthBucket,
            value: count(),
        })
        .from(articlePageViews)
        .where(gte(articlePageViews.createdAt, sinceDate))
        .groupBy(bucketPosition)
        .orderBy(bucketPosition);

    return buildFilledMonthlySeries(rows, months, now);
};
