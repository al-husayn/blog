import { and, count, desc, eq, gte, isNotNull } from 'drizzle-orm';
import {
    KEYWORD_LIMIT,
    MONTH_DAYS,
    QUARTER_DAYS,
    SOURCE_DETAIL_LIMIT,
    TRAFFIC_SOURCE_GROUPS,
    TRAFFIC_SOURCE_LABELS,
} from '@/lib/analytics/constants';
import { getDb } from '@/lib/db/client';
import { articlePageViews } from '@/lib/db/schema';
import { buildSinceDate } from '@/lib/analytics/date';
import { toNumber } from '@/lib/analytics/number';
import type {
    DashboardKeywordMetric,
    DashboardSourceSlice,
    TrafficSourceGroup,
} from '@/types/analytics';

const createEmptySourceMap = (): Map<TrafficSourceGroup, DashboardSourceSlice> =>
    new Map(
        TRAFFIC_SOURCE_GROUPS.map((key) => [
            key,
            {
                key,
                label: TRAFFIC_SOURCE_LABELS[key],
                value: 0,
                details: [],
            },
        ]),
    );

export const getSourceBreakdown = async (now: Date): Promise<DashboardSourceSlice[]> => {
    const db = getDb();
    const sinceDate = buildSinceDate(MONTH_DAYS, now);

    const rows = await db
        .select({
            group: articlePageViews.sourceGroup,
            detail: articlePageViews.sourceDetail,
            value: count(),
        })
        .from(articlePageViews)
        .where(gte(articlePageViews.createdAt, sinceDate))
        .groupBy(articlePageViews.sourceGroup, articlePageViews.sourceDetail);

    const sourceMap = createEmptySourceMap();

    for (const row of rows) {
        const sourceKey = row.group as TrafficSourceGroup;
        const sourceSlice = sourceMap.get(sourceKey);

        if (!sourceSlice) {
            console.warn('[analytics] Unknown traffic source group in dashboard breakdown.', {
                group: row.group,
                detail: row.detail,
                value: row.value,
            });
            continue;
        }

        const value = toNumber(row.value);
        sourceSlice.value += value;
        sourceSlice.details.push({
            label: row.detail ?? TRAFFIC_SOURCE_LABELS[sourceKey],
            value,
        });
    }

    return Array.from(sourceMap.values())
        .filter((slice) => slice.value > 0)
        .map((slice) => ({
            ...slice,
            details: [...slice.details]
                .sort((left, right) => right.value - left.value)
                .slice(0, SOURCE_DETAIL_LIMIT),
        }));
};

export const getTopKeywords = async (now: Date): Promise<DashboardKeywordMetric[]> => {
    const db = getDb();
    const sinceDate = buildSinceDate(QUARTER_DAYS, now);

    const rows = await db
        .select({
            keyword: articlePageViews.keyword,
            visits: count(),
        })
        .from(articlePageViews)
        .where(
            and(
                gte(articlePageViews.createdAt, sinceDate),
                eq(articlePageViews.sourceGroup, 'organic'),
                isNotNull(articlePageViews.keyword),
            ),
        )
        .groupBy(articlePageViews.keyword)
        .orderBy(desc(count()))
        .limit(KEYWORD_LIMIT);

    return rows
        .map((row) => ({
            keyword: row.keyword?.trim() ?? '',
            visits: toNumber(row.visits),
        }))
        .filter((row) => row.keyword.length > 0);
};
