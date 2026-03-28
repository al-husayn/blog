'use client';

import type {
    AnalyticsPageViewCompletionInput,
    AnalyticsPageViewInput,
    AnalyticsShareEventInput,
    ShareNetwork,
} from '@/types/analytics';

const VISITOR_STORAGE_KEY = 'blog.analytics.visitor';
const SESSION_STORAGE_KEY = 'blog.analytics.session';
const ACQUISITION_STORAGE_KEY = 'blog.analytics.acquisition';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

interface SessionState {
    id: string;
    lastTouchedAt: number;
}

interface AcquisitionState {
    referrer: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
}

const safeParseJson = <T>(value: string | null): T | null => {
    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
};

const createId = (): string =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const getLocalStorage = (): Storage | null => {
    try {
        return window.localStorage;
    } catch {
        return null;
    }
};

const getSessionStorage = (): Storage | null => {
    try {
        return window.sessionStorage;
    } catch {
        return null;
    }
};

const getOrCreateVisitorId = (): string => {
    const storage = getLocalStorage();
    const existingId = storage?.getItem(VISITOR_STORAGE_KEY)?.trim();

    if (existingId) {
        return existingId;
    }

    const nextId = createId();
    storage?.setItem(VISITOR_STORAGE_KEY, nextId);
    return nextId;
};

const getOrCreateSessionId = (): string => {
    const storage = getSessionStorage();
    const currentTimestamp = Date.now();
    const sessionState = safeParseJson<SessionState>(storage?.getItem(SESSION_STORAGE_KEY) ?? null);

    if (sessionState && currentTimestamp - sessionState.lastTouchedAt < SESSION_TIMEOUT_MS) {
        storage?.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify({
                ...sessionState,
                lastTouchedAt: currentTimestamp,
            }),
        );

        return sessionState.id;
    }

    const nextSessionState = {
        id: createId(),
        lastTouchedAt: currentTimestamp,
    };
    storage?.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSessionState));
    return nextSessionState.id;
};

const getCurrentAttribution = (): AcquisitionState => {
    const url = new URL(window.location.href);
    const referrer = document.referrer?.trim() ?? '';
    let externalReferrer: string | null = null;

    if (referrer) {
        try {
            const referrerUrl = new URL(referrer);
            if (referrerUrl.origin !== url.origin) {
                externalReferrer = referrerUrl.toString();
            }
        } catch {
            externalReferrer = null;
        }
    }

    return {
        referrer: externalReferrer,
        utmSource: url.searchParams.get('utm_source'),
        utmMedium: url.searchParams.get('utm_medium'),
        utmCampaign: url.searchParams.get('utm_campaign'),
    };
};

const getOrCreateAcquisitionState = (): AcquisitionState => {
    const storage = getSessionStorage();
    const existingState = safeParseJson<AcquisitionState>(
        storage?.getItem(ACQUISITION_STORAGE_KEY) ?? null,
    );

    if (existingState) {
        return existingState;
    }

    const nextState = getCurrentAttribution();
    storage?.setItem(ACQUISITION_STORAGE_KEY, JSON.stringify(nextState));
    return nextState;
};

const postJson = async (url: string, payload: unknown, keepalive = false): Promise<void> => {
    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        keepalive,
    });
};

const sendBeaconJson = (url: string, payload: unknown): void => {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const body = new Blob([JSON.stringify(payload)], {
            type: 'application/json',
        });
        const wasQueued = navigator.sendBeacon(url, body);

        if (wasQueued) {
            return;
        }
    }

    void postJson(url, payload, true);
};

const getAnalyticsIdentity = (): Pick<
    AnalyticsPageViewInput,
    'visitorId' | 'sessionId' | 'referrer' | 'utmSource' | 'utmMedium' | 'utmCampaign'
> => {
    const acquisitionState = getOrCreateAcquisitionState();

    return {
        visitorId: getOrCreateVisitorId(),
        sessionId: getOrCreateSessionId(),
        referrer: acquisitionState.referrer,
        utmSource: acquisitionState.utmSource,
        utmMedium: acquisitionState.utmMedium,
        utmCampaign: acquisitionState.utmCampaign,
    };
};

export const trackArticlePageViewStart = async (
    input: Pick<AnalyticsPageViewInput, 'pageViewId' | 'articleSlug' | 'path'>,
): Promise<void> => {
    await postJson('/api/analytics/pageviews', {
        ...input,
        ...getAnalyticsIdentity(),
    } satisfies AnalyticsPageViewInput);
};

export const trackArticlePageViewComplete = (
    input: AnalyticsPageViewCompletionInput,
): void => {
    sendBeaconJson(`/api/analytics/pageviews/${encodeURIComponent(input.pageViewId)}`, input);
};

export const trackArticleShare = async ({
    articleSlug,
    network,
}: {
    articleSlug: string;
    network: ShareNetwork;
}): Promise<void> => {
    const identity = getAnalyticsIdentity();
    const payload: AnalyticsShareEventInput = {
        articleSlug,
        visitorId: identity.visitorId,
        sessionId: identity.sessionId,
        network,
    };

    await postJson('/api/analytics/shares', payload, true);
};
