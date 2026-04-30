import { gte, inArray, sql } from 'drizzle-orm';
import { MONTH_DAYS } from '@/lib/analytics/constants';
import { getDb } from '@/lib/db/client';
import { articlePageViews } from '@/lib/db/schema';
import { buildSinceDate, toDate } from '@/lib/analytics/date';
import type { DashboardAnalytics } from '@/types/analytics';

const emptyAudience = (): DashboardAnalytics['newVsReturning30d'] => ({
    newVisitors: 0,
    returningVisitors: 0,
    total: 0,
});

export const getNewVsReturningVisitors = async (
    now: Date,
): Promise<DashboardAnalytics['newVsReturning30d']> => {
    const db = getDb();
    const sinceDate = buildSinceDate(MONTH_DAYS, now);
    const activeVisitorRows = await db
        .select({ visitorId: articlePageViews.visitorId })
        .from(articlePageViews)
        .where(gte(articlePageViews.createdAt, sinceDate))
        .groupBy(articlePageViews.visitorId);

    if (activeVisitorRows.length === 0) {
        return emptyAudience();
    }

    const activeVisitorIds = activeVisitorRows.map((row) => row.visitorId);
    const firstSeenRows = await db
        .select({
            visitorId: articlePageViews.visitorId,
            firstSeen: sql<string>`min(${articlePageViews.createdAt})`,
        })
        .from(articlePageViews)
        .where(inArray(articlePageViews.visitorId, activeVisitorIds))
        .groupBy(articlePageViews.visitorId);

    const newVisitors = firstSeenRows.filter((row) => {
        const firstSeenDate = toDate(row.firstSeen);
        return firstSeenDate ? firstSeenDate >= sinceDate : false;
    }).length;
    const total = firstSeenRows.length;

    return {
        newVisitors,
        returningVisitors: total - newVisitors,
        total,
    };
};
