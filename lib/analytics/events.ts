import { eq } from 'drizzle-orm';
import {
    BOUNCE_SCROLL_DEPTH,
    MAX_DAY_SECONDS,
    MAX_SCROLL_DEPTH,
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

const calculateBounce = ({
    engagedTimeSeconds,
    maxScrollDepth,
    reached50,
}: {
    engagedTimeSeconds: number;
    maxScrollDepth: number;
    reached50: boolean;
}): boolean =>
    engagedTimeSeconds < SESSION_ENGAGEMENT_THRESHOLD_SECONDS &&
    maxScrollDepth < BOUNCE_SCROLL_DEPTH &&
    !reached50;

export const createPageView = async (input: AnalyticsPageViewInput): Promise<void> => {
    const payload = pageViewSchema.parse(input);
    const db = getDb();
    const derivedTrafficSource = deriveTrafficSource(payload);

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
    const maxScrollDepth = Math.round(clampNumber(payload.maxScrollDepth, 0, MAX_SCROLL_DEPTH));
    const engagedTimeSeconds = Math.round(
        clampNumber(payload.engagedTimeSeconds, 0, MAX_DAY_SECONDS),
    );

    const updatedRows = await db
        .update(articlePageViews)
        .set({
            engagedTimeSeconds,
            maxScrollDepth,
            reached50: payload.reached50,
            reached75: payload.reached75,
            reached100: payload.reached100,
            didBounce: calculateBounce({
                engagedTimeSeconds,
                maxScrollDepth,
                reached50: payload.reached50,
            }),
            updatedAt: new Date(),
        })
        .where(eq(articlePageViews.id, payload.pageViewId))
        .returning({ id: articlePageViews.id });

    if (updatedRows.length === 0) {
        console.warn(
            `[analytics] Page view completion received for non-existent start record: ${payload.pageViewId}`,
        );
    }
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
