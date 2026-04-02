import { and, count, desc, eq, gte, inArray, isNotNull, lt, sql } from 'drizzle-orm';
import { z } from 'zod';
import { getBlogPages, getSlugFromPageUrl } from '@/lib/blog';
import { getDb } from '@/lib/db/client';
import { articlePageViews, articleShareEvents, articleUpvotes, comments } from '@/lib/db/schema';
import { parseDate } from '@/lib/utils';
import type {
    AnalyticsPageViewCompletionInput,
    AnalyticsPageViewInput,
    AnalyticsShareEventInput,
    AnalyticsTimeseriesPoint,
    DashboardAnalytics,
    DashboardKeywordMetric,
    DashboardPeriodMetric,
    DashboardShareMetric,
    DashboardSourceSlice,
    DashboardTopPostMetric,
    ShareNetwork,
    TrafficSourceGroup,
} from '@/types/analytics';
import type { BlogData } from '@/types/blog';

const TRAFFIC_SOURCE_LABELS: Record<TrafficSourceGroup, string> = {
    direct: 'Direct',
    organic: 'Organic search',
    social: 'Social',
    referral: 'Referrals',
};

const SHARE_NETWORK_LABELS: Record<ShareNetwork, string> = {
    x: 'X/Twitter',
    linkedin: 'LinkedIn',
    facebook: 'Facebook',
    whatsapp: 'WhatsApp',
    native: 'Native share',
    copy_link: 'Copy link',
};

const DAY_IN_MS = 86_400_000;
const SESSION_ENGAGEMENT_THRESHOLD_SECONDS = 15;
const TOP_POST_LIMIT = 8;
const KEYWORD_LIMIT = 8;
const COMMENTS_VELOCITY_WINDOW_HOURS = 48;
const PERIODS = [
    { label: '7d', days: 7 },
    { label: '30d', days: 30 },
    { label: '90d', days: 90 },
    { label: 'All-time', days: null },
] as const;
const UTC_DAY_FORMATTER = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
});
const UTC_MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
});

const pageViewSchema = z.object({
    pageViewId: z.string().trim().min(1).max(128),
    articleSlug: z.string().trim().min(1).max(200),
    path: z.string().trim().min(1).max(500),
    visitorId: z.string().trim().min(1).max(128),
    sessionId: z.string().trim().min(1).max(128),
    referrer: z.string().trim().max(1_000).nullish(),
    utmSource: z.string().trim().max(100).nullish(),
    utmMedium: z.string().trim().max(100).nullish(),
    utmCampaign: z.string().trim().max(120).nullish(),
});

const pageViewCompletionSchema = z.object({
    pageViewId: z.string().trim().min(1).max(128),
    engagedTimeSeconds: z.number().min(0).max(86_400),
    maxScrollDepth: z.number().min(0).max(100),
    reached50: z.boolean(),
    reached75: z.boolean(),
    reached100: z.boolean(),
});

const shareEventSchema = z.object({
    articleSlug: z.string().trim().min(1).max(200),
    visitorId: z.string().trim().min(1).max(128),
    sessionId: z.string().trim().min(1).max(128),
    network: z.enum(['x', 'linkedin', 'facebook', 'whatsapp', 'native', 'copy_link']),
});

interface DerivedTrafficSource {
    group: TrafficSourceGroup;
    detail: string;
    referrerHost: string | null;
    keyword: string | null;
}

interface ArticleMetadata {
    slug: string;
    title: string;
    description: string;
    publishedAt: string;
    publishedDate: Date | null;
}

const toNumber = (value: number | string | bigint | null | undefined): number =>
    typeof value === 'number'
        ? value
        : typeof value === 'bigint'
          ? Number(value)
          : typeof value === 'string'
            ? Number.parseFloat(value)
            : 0;

const toDate = (value: Date | string | null | undefined): Date | null => {
    if (!value) {
        return null;
    }

    const parsedDate = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const clampNumber = (value: number, min: number, max: number): number =>
    Math.min(max, Math.max(min, value));

const normalizeNullableString = (value: string | null | undefined): string | null => {
    if (!value) {
        return null;
    }

    const normalizedValue = value.trim();
    return normalizedValue.length > 0 ? normalizedValue : null;
};

const normalizeHost = (value: string): string => value.toLowerCase().replace(/^www\./, '');

const prettifyHost = (value: string): string =>
    value
        .replace(/^www\./, '')
        .split('.')
        .slice(0, -1)
        .join('.')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase()) || value;

const stripReferrerPath = (value: string | null | undefined): string | null => {
    const normalizedValue = normalizeNullableString(value);
    if (!normalizedValue) {
        return null;
    }

    try {
        const referrerUrl = new URL(normalizedValue);
        return referrerUrl.origin;
    } catch {
        return null;
    }
};

const formatDayKey = (value: Date): string => value.toISOString().slice(0, 10);

const formatDayLabel = (value: Date): string => UTC_DAY_FORMATTER.format(value);

const formatMonthKey = (value: Date): string =>
    `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, '0')}`;

const formatMonthLabel = (value: Date): string => UTC_MONTH_FORMATTER.format(value);

const startOfUtcDay = (value: Date): Date =>
    new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));

const startOfUtcMonth = (value: Date): Date =>
    new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), 1));

const subtractDays = (value: Date, days: number): Date =>
    new Date(value.getTime() - days * DAY_IN_MS);

const subtractMonths = (value: Date, months: number): Date =>
    new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth() - months, 1));

const buildSinceDate = (days: number, now: Date): Date =>
    startOfUtcDay(subtractDays(now, days - 1));

const getGrowthDelta = (currentValue: number, previousValue: number): number | null => {
    if (previousValue === 0) {
        return currentValue === 0 ? null : 100;
    }

    return ((currentValue - previousValue) / previousValue) * 100;
};

const roundToOneDecimal = (value: number): number => Math.round(value * 10) / 10;

export const isMissingAnalyticsTablesError = (error: unknown): boolean => {
    if (!error || typeof error !== 'object') {
        return false;
    }

    const candidate = error as { code?: string; message?: string };

    return (
        candidate.code === '42P01' ||
        candidate.message?.includes('article_page_views') === true ||
        candidate.message?.includes('article_share_events') === true
    );
};

const inferSourceFromUtm = (
    utmSource: string | null,
    utmMedium: string | null,
): Pick<DerivedTrafficSource, 'group' | 'detail'> | null => {
    const normalizedSource = utmSource?.toLowerCase() ?? '';
    const normalizedMedium = utmMedium?.toLowerCase() ?? '';

    if (
        normalizedMedium.includes('organic') ||
        normalizedSource.includes('google') ||
        normalizedSource.includes('bing') ||
        normalizedSource.includes('duckduckgo') ||
        normalizedSource.includes('yahoo') ||
        normalizedSource.includes('ecosia') ||
        normalizedSource.includes('brave')
    ) {
        return {
            group: 'organic',
            detail: prettifyHost(normalizedSource || 'Organic'),
        };
    }

    if (normalizedMedium.includes('social')) {
        return {
            group: 'social',
            detail: prettifyHost(normalizedSource || 'Social'),
        };
    }

    const sourceTokens = normalizedSource.split(/[^a-z0-9]+/);
    if (
        sourceTokens.some((token) => ['x', 'twitter', 'linkedin', 'reddit', 'hn'].includes(token))
    ) {
        return {
            group: 'social',
            detail: prettifyHost(normalizedSource || 'Social'),
        };
    }

    if (normalizedMedium.includes('referral')) {
        return {
            group: 'referral',
            detail: prettifyHost(normalizedSource || 'Referral'),
        };
    }

    if (normalizedMedium.includes('email')) {
        return {
            group: 'referral',
            detail: 'Email',
        };
    }

    return null;
};

const extractKeywordFromReferrer = (referrerUrl: URL): string | null => {
    const searchParams = referrerUrl.searchParams;
    const candidateValue =
        searchParams.get('q') ??
        searchParams.get('p') ??
        searchParams.get('query') ??
        searchParams.get('text') ??
        searchParams.get('wd') ??
        searchParams.get('keyword');

    if (!candidateValue) {
        return null;
    }

    const normalizedValue = candidateValue.trim().replace(/\s+/g, ' ');
    return normalizedValue.length > 0 ? normalizedValue.slice(0, 120) : null;
};

const deriveTrafficSource = ({
    referrer,
    utmSource,
    utmMedium,
}: {
    referrer?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
}): DerivedTrafficSource => {
    const inferredUtmSource = inferSourceFromUtm(
        normalizeNullableString(utmSource),
        normalizeNullableString(utmMedium),
    );

    if (inferredUtmSource) {
        return {
            group: inferredUtmSource.group,
            detail: inferredUtmSource.detail,
            referrerHost: null,
            keyword: null,
        };
    }

    const normalizedReferrer = normalizeNullableString(referrer);
    if (!normalizedReferrer) {
        return {
            group: 'direct',
            detail: 'Direct',
            referrerHost: null,
            keyword: null,
        };
    }

    try {
        const referrerUrl = new URL(normalizedReferrer);
        const referrerHost = normalizeHost(referrerUrl.hostname);

        if (referrerHost.includes('google.')) {
            return {
                group: 'organic',
                detail: 'Google',
                referrerHost,
                keyword: extractKeywordFromReferrer(referrerUrl),
            };
        }

        if (referrerHost.includes('bing.')) {
            return {
                group: 'organic',
                detail: 'Bing',
                referrerHost,
                keyword: extractKeywordFromReferrer(referrerUrl),
            };
        }

        if (referrerHost.includes('duckduckgo.com')) {
            return {
                group: 'organic',
                detail: 'DuckDuckGo',
                referrerHost,
                keyword: extractKeywordFromReferrer(referrerUrl),
            };
        }

        if (referrerHost.includes('search.yahoo.com')) {
            return {
                group: 'organic',
                detail: 'Yahoo',
                referrerHost,
                keyword: extractKeywordFromReferrer(referrerUrl),
            };
        }

        if (referrerHost.includes('ecosia.org')) {
            return {
                group: 'organic',
                detail: 'Ecosia',
                referrerHost,
                keyword: extractKeywordFromReferrer(referrerUrl),
            };
        }

        if (referrerHost.includes('search.brave.com')) {
            return {
                group: 'organic',
                detail: 'Brave Search',
                referrerHost,
                keyword: extractKeywordFromReferrer(referrerUrl),
            };
        }

        if (referrerHost.includes('x.com') || referrerHost.includes('twitter.com')) {
            return {
                group: 'social',
                detail: 'X/Twitter',
                referrerHost,
                keyword: null,
            };
        }

        if (referrerHost.includes('linkedin.com')) {
            return {
                group: 'social',
                detail: 'LinkedIn',
                referrerHost,
                keyword: null,
            };
        }

        if (referrerHost.includes('reddit.com')) {
            return {
                group: 'social',
                detail: 'Reddit',
                referrerHost,
                keyword: null,
            };
        }

        if (referrerHost.includes('news.ycombinator.com')) {
            return {
                group: 'social',
                detail: 'HN',
                referrerHost,
                keyword: null,
            };
        }

        return {
            group: 'referral',
            detail: prettifyHost(referrerHost),
            referrerHost,
            keyword: null,
        };
    } catch {
        return {
            group: 'direct',
            detail: 'Direct',
            referrerHost: null,
            keyword: null,
        };
    }
};

const getArticleMetadataMap = (): Map<string, ArticleMetadata> => {
    const metadataBySlug = new Map<string, ArticleMetadata>();

    for (const page of getBlogPages<BlogData>()) {
        const slug = getSlugFromPageUrl(page.url);

        if (!slug) {
            continue;
        }

        metadataBySlug.set(slug, {
            slug,
            title: page.data.title,
            description: page.data.description,
            publishedAt: page.data.date,
            publishedDate: parseDate(page.data.date),
        });
    }

    return metadataBySlug;
};

const buildFilledSeries = (
    rows: Array<{ day: string; value: number | string | bigint }>,
    days: number,
    now: Date,
): AnalyticsTimeseriesPoint[] => {
    const valuesByDay = new Map(rows.map((row) => [row.day, toNumber(row.value)]));
    const series: AnalyticsTimeseriesPoint[] = [];
    const firstDay = buildSinceDate(days, now);

    for (let offset = 0; offset < days; offset += 1) {
        const currentDay = new Date(firstDay.getTime() + offset * DAY_IN_MS);
        const dayKey = formatDayKey(currentDay);

        series.push({
            date: dayKey,
            label: formatDayLabel(currentDay),
            value: valuesByDay.get(dayKey) ?? 0,
        });
    }

    return series;
};

const buildFilledMonthlySeries = (
    rows: Array<{ month: string; value: number | string | bigint }>,
    months: number,
    now: Date,
): AnalyticsTimeseriesPoint[] => {
    const valuesByMonth = new Map(rows.map((row) => [row.month, toNumber(row.value)]));
    const series: AnalyticsTimeseriesPoint[] = [];
    const firstMonth = startOfUtcMonth(subtractMonths(now, months - 1));

    for (let offset = 0; offset < months; offset += 1) {
        const currentMonth = new Date(
            Date.UTC(firstMonth.getUTCFullYear(), firstMonth.getUTCMonth() + offset, 1),
        );
        const monthKey = formatMonthKey(currentMonth);

        series.push({
            date: monthKey,
            label: formatMonthLabel(currentMonth),
            value: valuesByMonth.get(monthKey) ?? 0,
        });
    }

    return series;
};

const calculateEngagementScore = ({
    avgEngagementSeconds,
    avgScrollDepth,
    bounceRate,
}: {
    avgEngagementSeconds: number;
    avgScrollDepth: number;
    bounceRate: number;
}): number => {
    const timeScore = Math.min(avgEngagementSeconds / 240, 1) * 45;
    const scrollScore = Math.min(avgScrollDepth / 100, 1) * 35;
    const bounceScore = Math.max(0, 1 - bounceRate / 100) * 20;

    return Math.round(timeScore + scrollScore + bounceScore);
};

const getPeriodTotals = async (
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

const getDailyViewsSeries = async ({
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

    const rows = await db
        .select({
            day: dayBucket,
            value: count(),
        })
        .from(articlePageViews)
        .where(
            sourceGroup
                ? and(
                      gte(articlePageViews.createdAt, sinceDate),
                      eq(articlePageViews.sourceGroup, sourceGroup),
                  )
                : gte(articlePageViews.createdAt, sinceDate),
        )
        .groupBy(bucketPosition)
        .orderBy(bucketPosition);

    return buildFilledSeries(rows, days, now);
};

const getMonthlyViewsSeries = async ({
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

const getPreviousThirtyDayViews = async (now: Date): Promise<number> => {
    const db = getDb();
    const currentWindowStart = buildSinceDate(30, now);
    const previousWindowStart = buildSinceDate(60, now);

    const [row] = await db
        .select({
            views: count(),
        })
        .from(articlePageViews)
        .where(
            and(
                gte(articlePageViews.createdAt, previousWindowStart),
                lt(articlePageViews.createdAt, currentWindowStart),
            ),
        );

    return toNumber(row?.views);
};

const getSourceBreakdown = async (now: Date): Promise<DashboardSourceSlice[]> => {
    const db = getDb();
    const sinceDate = buildSinceDate(30, now);

    const rows = await db
        .select({
            group: articlePageViews.sourceGroup,
            detail: articlePageViews.sourceDetail,
            value: count(),
        })
        .from(articlePageViews)
        .where(gte(articlePageViews.createdAt, sinceDate))
        .groupBy(articlePageViews.sourceGroup, articlePageViews.sourceDetail);

    const sourceMap = new Map<TrafficSourceGroup, DashboardSourceSlice>();

    for (const key of ['direct', 'organic', 'social', 'referral'] as const) {
        sourceMap.set(key, {
            key,
            label: TRAFFIC_SOURCE_LABELS[key],
            value: 0,
            details: [],
        });
    }

    for (const row of rows) {
        const sourceKey = row.group as TrafficSourceGroup;
        const sourceSlice = sourceMap.get(sourceKey);

        if (!sourceSlice) {
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
            details: [...slice.details].sort((left, right) => right.value - left.value).slice(0, 5),
        }));
};

const getTopKeywords = async (now: Date): Promise<DashboardKeywordMetric[]> => {
    const db = getDb();
    const sinceDate = buildSinceDate(90, now);

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

const getEngagementSummary = async (
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
    const sinceDate = buildSinceDate(30, now);

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

const getNewVsReturningVisitors = async (
    now: Date,
): Promise<DashboardAnalytics['newVsReturning30d']> => {
    const db = getDb();
    const sinceDate = buildSinceDate(30, now);
    const activeVisitorRows = await db
        .select({
            visitorId: articlePageViews.visitorId,
        })
        .from(articlePageViews)
        .where(gte(articlePageViews.createdAt, sinceDate))
        .groupBy(articlePageViews.visitorId);

    if (activeVisitorRows.length === 0) {
        return {
            newVisitors: 0,
            returningVisitors: 0,
            total: 0,
        };
    }

    const firstSeenRows = await db
        .select({
            visitorId: articlePageViews.visitorId,
            firstSeen: sql<string>`min(${articlePageViews.createdAt})`,
        })
        .from(articlePageViews)
        .where(
            inArray(
                articlePageViews.visitorId,
                activeVisitorRows.map((row) => row.visitorId),
            ),
        )
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

const getShareMetrics = async (
    now: Date,
): Promise<{
    shareBreakdown30d: DashboardShareMetric[];
    totalShares30d: number;
    shares30dBySlug: Map<string, number>;
    sharesAllTimeBySlug: Map<string, number>;
}> => {
    const db = getDb();
    const sinceDate = buildSinceDate(30, now);

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
        shares30dBySlug: new Map(slugRows30d.map((row) => [row.articleSlug, toNumber(row.value)])),
        sharesAllTimeBySlug: new Map(
            slugRowsAllTime.map((row) => [row.articleSlug, toNumber(row.value)]),
        ),
    };
};

const getReactionMaps = async (): Promise<{
    commentsBySlug: Map<string, number>;
    reactionsBySlug: Map<string, number>;
}> => {
    const db = getDb();

    const [commentRows, reactionRows] = await Promise.all([
        db
            .select({
                articleSlug: comments.articleSlug,
                value: count(),
            })
            .from(comments)
            .groupBy(comments.articleSlug),
        db
            .select({
                articleSlug: articleUpvotes.articleSlug,
                value: count(),
            })
            .from(articleUpvotes)
            .groupBy(articleUpvotes.articleSlug),
    ]);

    return {
        commentsBySlug: new Map(commentRows.map((row) => [row.articleSlug, toNumber(row.value)])),
        reactionsBySlug: new Map(reactionRows.map((row) => [row.articleSlug, toNumber(row.value)])),
    };
};

const getCommentVelocityMap = async (
    articleMetadataBySlug: Map<string, ArticleMetadata>,
): Promise<Map<string, { comments48h: number; commentsVelocityPerHour: number }>> => {
    const db = getDb();
    const commentRows = await db
        .select({
            articleSlug: comments.articleSlug,
            createdAt: comments.createdAt,
        })
        .from(comments);

    const velocityBySlug = new Map<
        string,
        { comments48h: number; commentsVelocityPerHour: number }
    >();

    for (const row of commentRows) {
        const metadata = articleMetadataBySlug.get(row.articleSlug);
        const commentDate = toDate(row.createdAt);

        if (!metadata?.publishedDate || !commentDate) {
            continue;
        }

        const publishWindowEnd = new Date(
            metadata.publishedDate.getTime() + COMMENTS_VELOCITY_WINDOW_HOURS * 60 * 60 * 1000,
        );

        if (commentDate > publishWindowEnd) {
            continue;
        }

        const existingMetric = velocityBySlug.get(row.articleSlug) ?? {
            comments48h: 0,
            commentsVelocityPerHour: 0,
        };
        const comments48h = existingMetric.comments48h + 1;

        velocityBySlug.set(row.articleSlug, {
            comments48h,
            commentsVelocityPerHour: roundToOneDecimal(
                comments48h / COMMENTS_VELOCITY_WINDOW_HOURS,
            ),
        });
    }

    return velocityBySlug;
};

const getTopPosts = async (
    now: Date,
): Promise<{
    topPosts: DashboardTopPostMetric[];
    topPostsAllTime: DashboardTopPostMetric[];
    totalReactionsAllTime: number;
    avgInteractionsPerPost: number;
}> => {
    const db = getDb();
    const sinceDate = buildSinceDate(30, now);
    const articleMetadataBySlug = getArticleMetadataMap();

    const [
        recentPageViewRows,
        allTimePageViewRows,
        shareMetrics,
        reactionMaps,
        commentVelocityBySlug,
    ] = await Promise.all([
        db
            .select({
                articleSlug: articlePageViews.articleSlug,
                views30d: count(),
                uniqueVisitors30d: sql<number>`count(distinct ${articlePageViews.visitorId})`,
                avgEngagementSeconds: sql<number>`coalesce(avg(${articlePageViews.engagedTimeSeconds}), 0)`,
                bounceRate: sql<number>`coalesce(avg(case when ${articlePageViews.didBounce} then 1 else 0 end), 0)`,
            })
            .from(articlePageViews)
            .where(gte(articlePageViews.createdAt, sinceDate))
            .groupBy(articlePageViews.articleSlug),
        db
            .select({
                articleSlug: articlePageViews.articleSlug,
                viewsAllTime: count(),
            })
            .from(articlePageViews)
            .groupBy(articlePageViews.articleSlug),
        getShareMetrics(now),
        getReactionMaps(),
        getCommentVelocityMap(articleMetadataBySlug),
    ]);

    const recentMetricsBySlug = new Map(
        recentPageViewRows.map((row) => [
            row.articleSlug,
            {
                views30d: toNumber(row.views30d),
                uniqueVisitors30d: toNumber(row.uniqueVisitors30d),
                avgEngagementSeconds: Math.round(toNumber(row.avgEngagementSeconds)),
                bounceRate: roundToOneDecimal(toNumber(row.bounceRate) * 100),
            },
        ]),
    );
    const allTimeViewsBySlug = new Map(
        allTimePageViewRows.map((row) => [row.articleSlug, toNumber(row.viewsAllTime)]),
    );

    const candidateSlugs = new Set<string>([
        ...allTimeViewsBySlug.keys(),
        ...recentMetricsBySlug.keys(),
        ...articleMetadataBySlug.keys(),
    ]);

    const postMetrics = Array.from(candidateSlugs)
        .map((slug) => {
            const metadata = articleMetadataBySlug.get(slug);
            const recentMetrics = recentMetricsBySlug.get(slug);
            const commentVelocity = commentVelocityBySlug.get(slug);
            const shares30d = shareMetrics.shares30dBySlug.get(slug) ?? 0;

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
                shares30d,
                comments48h: commentVelocity?.comments48h ?? 0,
                commentsVelocityPerHour: commentVelocity?.commentsVelocityPerHour ?? 0,
            };
        })
        .filter(
            (metric) =>
                metric.viewsAllTime > 0 ||
                metric.reactions > 0 ||
                metric.comments > 0 ||
                metric.shares30d > 0,
        );

    const topPosts = [...postMetrics]
        .sort((leftMetric, rightMetric) => {
            if (rightMetric.views30d !== leftMetric.views30d) {
                return rightMetric.views30d - leftMetric.views30d;
            }

            return rightMetric.viewsAllTime - leftMetric.viewsAllTime;
        })
        .slice(0, TOP_POST_LIMIT);

    const topPostsAllTime = [...postMetrics]
        .sort((leftMetric, rightMetric) => {
            if (rightMetric.viewsAllTime !== leftMetric.viewsAllTime) {
                return rightMetric.viewsAllTime - leftMetric.viewsAllTime;
            }

            return rightMetric.views30d - leftMetric.views30d;
        })
        .slice(0, TOP_POST_LIMIT);

    const totalReactionsAllTime = Array.from(candidateSlugs).reduce((total, slug) => {
        const commentsCount = reactionMaps.commentsBySlug.get(slug) ?? 0;
        const reactionsCount = reactionMaps.reactionsBySlug.get(slug) ?? 0;
        const shareCount = shareMetrics.sharesAllTimeBySlug.get(slug) ?? 0;

        return total + commentsCount + reactionsCount + shareCount;
    }, 0);

    const avgInteractionsPerPost =
        candidateSlugs.size === 0
            ? 0
            : roundToOneDecimal(totalReactionsAllTime / candidateSlugs.size);

    return {
        topPosts,
        topPostsAllTime,
        totalReactionsAllTime,
        avgInteractionsPerPost,
    };
};

export const createPageView = async (input: AnalyticsPageViewInput): Promise<void> => {
    const payload = pageViewSchema.parse(input);
    const db = getDb();
    const derivedTrafficSource = deriveTrafficSource({
        referrer: payload.referrer,
        utmSource: payload.utmSource,
        utmMedium: payload.utmMedium,
    });

    await db
        .insert(articlePageViews)
        .values({
            id: payload.pageViewId,
            articleSlug: payload.articleSlug,
            path: payload.path,
            visitorId: payload.visitorId,
            sessionId: payload.sessionId,
            sourceGroup: derivedTrafficSource.group,
            sourceDetail: derivedTrafficSource.detail,
            referrerHost: derivedTrafficSource.referrerHost,
            referrerUrl: stripReferrerPath(payload.referrer),
            keyword: derivedTrafficSource.keyword,
            utmSource: normalizeNullableString(payload.utmSource),
            utmMedium: normalizeNullableString(payload.utmMedium),
            utmCampaign: normalizeNullableString(payload.utmCampaign),
        })
        .onConflictDoNothing();
};

export const completePageView = async (input: AnalyticsPageViewCompletionInput): Promise<void> => {
    const payload = pageViewCompletionSchema.parse(input);
    const db = getDb();
    const maxScrollDepth = Math.round(clampNumber(payload.maxScrollDepth, 0, 100));
    const engagedTimeSeconds = Math.round(clampNumber(payload.engagedTimeSeconds, 0, 86_400));
    const didBounce =
        engagedTimeSeconds < SESSION_ENGAGEMENT_THRESHOLD_SECONDS &&
        maxScrollDepth < 50 &&
        !payload.reached50;

    // Verify the page view start record exists before completing
    const [existingRecord] = await db
        .select({ id: articlePageViews.id })
        .from(articlePageViews)
        .where(eq(articlePageViews.id, payload.pageViewId));

    if (!existingRecord) {
        console.warn(
            `[analytics] Page view completion received for non-existent start record: ${payload.pageViewId}`,
        );
        return;
    }

    await db
        .update(articlePageViews)
        .set({
            engagedTimeSeconds,
            maxScrollDepth,
            reached50: payload.reached50,
            reached75: payload.reached75,
            reached100: payload.reached100,
            didBounce,
            updatedAt: new Date(),
        })
        .where(eq(articlePageViews.id, payload.pageViewId));
};

export const createShareEvent = async (input: AnalyticsShareEventInput): Promise<void> => {
    const payload = shareEventSchema.parse(input);
    const db = getDb();

    await db.insert(articleShareEvents).values({
        id: crypto.randomUUID(),
        articleSlug: payload.articleSlug,
        visitorId: payload.visitorId,
        sessionId: payload.sessionId,
        network: payload.network,
    });
};

export const getDashboardAnalytics = async (): Promise<DashboardAnalytics> => {
    const now = new Date();
    const [
        trend7d,
        trend30d,
        trend90d,
        trendAllTime,
        pageviewSparkline,
        previousThirtyDayViews,
        sources30d,
        organicTrend90d,
        topKeywords90d,
        engagementSummary,
        newVsReturning30d,
        shareMetrics,
        topPostMetrics,
    ] = await Promise.all([
        getDailyViewsSeries({ days: 7, now }),
        getDailyViewsSeries({ days: 30, now }),
        getDailyViewsSeries({ days: 90, now }),
        getMonthlyViewsSeries({ months: 12, now }),
        getDailyViewsSeries({ days: 30, now }),
        getPreviousThirtyDayViews(now),
        getSourceBreakdown(now),
        getDailyViewsSeries({ days: 90, now, sourceGroup: 'organic' }),
        getTopKeywords(now),
        getEngagementSummary(now),
        getNewVsReturningVisitors(now),
        getShareMetrics(now),
        getTopPosts(now),
    ]);

    const periods = await getPeriodTotals(
        now,
        new Map<string, AnalyticsTimeseriesPoint[]>([
            ['7d', trend7d],
            ['30d', trend30d],
            ['90d', trend90d],
            ['All-time', trendAllTime],
        ]),
    );

    const thirtyDayMetric = periods.find((period) => period.days === 30);
    const views30d = thirtyDayMetric?.views ?? 0;

    return {
        generatedAt: now.toISOString(),
        periods,
        views30d,
        viewsDeltaVsPrevious30d: getGrowthDelta(views30d, previousThirtyDayViews),
        pageviewSparkline,
        uniqueVisitors30d: thirtyDayMetric?.uniqueVisitors ?? 0,
        uniqueVisitorsAllTime: periods.find((period) => period.days === null)?.uniqueVisitors ?? 0,
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
