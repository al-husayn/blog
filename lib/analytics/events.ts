import { eq, sql } from 'drizzle-orm';
import {
    BOUNCE_SCROLL_DEPTH,
    MAX_DAY_SECONDS,
    MAX_SCROLL_DEPTH,
    SCROLL_REACH_100,
    SCROLL_REACH_50,
    SCROLL_REACH_75,
    SESSION_ENGAGEMENT_THRESHOLD_SECONDS,
} from '@/lib/analytics/constants';
import { getDb } from '@/lib/db/client';
import { articlePageViews, articleShareEvents } from '@/lib/db/schema';
import { clampNumber } from '@/lib/analytics/number';
import {
    pageViewCompletionSchema,
    pageViewSchema,
    shareEventSchema,
} from '@/lib/analytics/schemas';
import { normalizeNullableString, stripReferrerPath } from '@/lib/analytics/string';
import { deriveTrafficSource } from '@/lib/analytics/traffic-source';
import type {
    AnalyticsPageViewCompletionInput,
    AnalyticsPageViewInput,
    AnalyticsShareEventInput,
} from '@/types/analytics';

const isMissingAnalyticsTableError = (error: unknown, tableName: string): boolean => {
    if (typeof error !== 'object' || error === null) {
        return false;
    }

    const err = error as { code?: string; message?: string };
    const message = err.message?.toLowerCase() ?? '';

    if (err.code === '42P01') {
        return true;
    }

    return (
        (message.includes('does not exist') || message.includes('no such table')) &&
        message.includes(tableName.toLowerCase())
    );
};

export const createPageView = async (input: AnalyticsPageViewInput): Promise<void> => {
    const payload = pageViewSchema.parse(input);
    const db = getDb();
    const derivedTrafficSource = deriveTrafficSource(payload);

    try {
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
    } catch (error) {
        if (isMissingAnalyticsTableError(error, 'article_page_views')) {
            console.warn(
                '[analytics] Skipping page view write because analytics table "article_page_views" is missing.',
                error,
            );
            return;
        }

        throw error;
    }
};

export const completePageView = async (input: AnalyticsPageViewCompletionInput): Promise<void> => {
    const payload = pageViewCompletionSchema.parse(input);
    const db = getDb();
    const maxScrollDepth = Math.round(clampNumber(payload.maxScrollDepth, 0, MAX_SCROLL_DEPTH));
    const engagedTimeSeconds = Math.round(
        clampNumber(payload.engagedTimeSeconds, 0, MAX_DAY_SECONDS),
    );
    const reached50 = maxScrollDepth >= SCROLL_REACH_50;
    const reached75 = maxScrollDepth >= SCROLL_REACH_75;
    const reached100 = maxScrollDepth >= SCROLL_REACH_100;

    const engagedTimeSecondsExpression = sql`
        GREATEST(COALESCE(${articlePageViews.engagedTimeSeconds}, 0), ${engagedTimeSeconds})
    `;
    const maxScrollDepthExpression = sql`
        GREATEST(COALESCE(${articlePageViews.maxScrollDepth}, 0), ${maxScrollDepth})
    `;
    const reached50Expression = sql`
        COALESCE(${articlePageViews.reached50}, FALSE) OR ${reached50}
    `;
    const reached75Expression = sql`
        COALESCE(${articlePageViews.reached75}, FALSE) OR ${reached75}
    `;
    const reached100Expression = sql`
        COALESCE(${articlePageViews.reached100}, FALSE) OR ${reached100}
    `;
    const didBounceExpression = sql`
        CASE
            WHEN ${engagedTimeSecondsExpression} < ${SESSION_ENGAGEMENT_THRESHOLD_SECONDS}
              AND ${maxScrollDepthExpression} < ${BOUNCE_SCROLL_DEPTH}
              AND NOT ${reached50Expression}
            THEN TRUE
            ELSE FALSE
        END
    `;

    let updatedRows: Array<{ id: string }>;

    try {
        updatedRows = await db
            .update(articlePageViews)
            .set({
                engagedTimeSeconds: engagedTimeSecondsExpression,
                maxScrollDepth: maxScrollDepthExpression,
                reached50: reached50Expression,
                reached75: reached75Expression,
                reached100: reached100Expression,
                didBounce: didBounceExpression,
                updatedAt: new Date(),
            })
            .where(eq(articlePageViews.id, payload.pageViewId))
            .returning({ id: articlePageViews.id });
    } catch (error) {
        if (isMissingAnalyticsTableError(error, 'article_page_views')) {
            console.warn(
                '[analytics] Skipping page view completion write because analytics table "article_page_views" is missing.',
                error,
            );
            return;
        }

        throw error;
    }

    if (updatedRows.length === 0) {
        console.warn(
            `[analytics] Page view completion received for non-existent start record: ${payload.pageViewId}`,
        );
    }
};

export const createShareEvent = async (input: AnalyticsShareEventInput): Promise<void> => {
    const payload = shareEventSchema.parse(input);
    const db = getDb();

    try {
        await db.insert(articleShareEvents).values({
            id: crypto.randomUUID(),
            articleSlug: payload.articleSlug,
            visitorId: payload.visitorId,
            sessionId: payload.sessionId,
            network: payload.network,
        });
    } catch (error) {
        if (isMissingAnalyticsTableError(error, 'article_share_events')) {
            console.warn(
                '[analytics] Skipping share event write because analytics table "article_share_events" is missing.',
                error,
            );
            return;
        }

        throw error;
    }
};
