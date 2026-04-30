import { count, desc, gte } from 'drizzle-orm';
import { MONTH_DAYS, SHARE_NETWORK_LABELS } from '@/lib/analytics/constants';
import { getDb } from '@/lib/db/client';
import { articleShareEvents } from '@/lib/db/schema';
import { buildSinceDate } from '@/lib/analytics/date';
import { toNumber } from '@/lib/analytics/number';
import type { ShareMetrics } from '@/lib/analytics/types';
import type { ShareNetwork } from '@/types/analytics';

const toCountMap = (rows: Array<{ articleSlug: string; value: number | string | bigint }>) =>
    new Map(rows.map((row) => [row.articleSlug, toNumber(row.value)]));

export const getShareMetrics = async (now: Date): Promise<ShareMetrics> => {
    const db = getDb();
    const sinceDate = buildSinceDate(MONTH_DAYS, now);

    const [breakdownRows, slugRows30d, slugRowsAllTime] = await Promise.all([
        db
            .select({
                network: articleShareEvents.network,
                value: count(),
            })
            .from(articleShareEvents)
            .where(gte(articleShareEvents.createdAt, sinceDate))
            .groupBy(articleShareEvents.network)
            .orderBy(desc(count())),
        db
            .select({
                articleSlug: articleShareEvents.articleSlug,
                value: count(),
            })
            .from(articleShareEvents)
            .where(gte(articleShareEvents.createdAt, sinceDate))
            .groupBy(articleShareEvents.articleSlug),
        db
            .select({
                articleSlug: articleShareEvents.articleSlug,
                value: count(),
            })
            .from(articleShareEvents)
            .groupBy(articleShareEvents.articleSlug),
    ]);

    const shareBreakdown30d = breakdownRows.map((row) => {
        const network = row.network as ShareNetwork;

        return {
            network,
            label: SHARE_NETWORK_LABELS[network] ?? row.network,
            value: toNumber(row.value),
        };
    });

    return {
        shareBreakdown30d,
        totalShares30d: shareBreakdown30d.reduce((total, item) => total + item.value, 0),
        shares30dBySlug: toCountMap(slugRows30d),
        sharesAllTimeBySlug: toCountMap(slugRowsAllTime),
    };
};
