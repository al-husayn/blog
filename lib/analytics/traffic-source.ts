import { FIELD_LIMITS } from '@/lib/analytics/constants';
import { normalizeHost, normalizeNullableString, prettifyHost } from '@/lib/analytics/string';
import type { DerivedTrafficSource } from '@/lib/analytics/types';
import type { TrafficSourceGroup } from '@/types/analytics';

const ORGANIC_UTM_SOURCES = ['google', 'bing', 'duckduckgo', 'yahoo', 'ecosia', 'brave'];
const SOCIAL_UTM_TOKENS = new Set(['x', 'twitter', 'linkedin', 'reddit', 'hn']);
const SEARCH_KEYWORD_PARAMS = ['q', 'p', 'query', 'text', 'wd', 'keyword'];

const SEARCH_REFERRERS = [
    { hostIncludes: 'google.', detail: 'Google' },
    { hostIncludes: 'bing.', detail: 'Bing' },
    { hostIncludes: 'duckduckgo.com', detail: 'DuckDuckGo' },
    { hostIncludes: 'search.yahoo.com', detail: 'Yahoo' },
    { hostIncludes: 'ecosia.org', detail: 'Ecosia' },
    { hostIncludes: 'search.brave.com', detail: 'Brave Search' },
] as const;

const SOCIAL_REFERRERS = [
    { hostIncludes: 'x.com', detail: 'X/Twitter' },
    { hostIncludes: 'twitter.com', detail: 'X/Twitter' },
    { hostIncludes: 'linkedin.com', detail: 'LinkedIn' },
    { hostIncludes: 'reddit.com', detail: 'Reddit' },
    { hostIncludes: 'news.ycombinator.com', detail: 'HN' },
] as const;

const directSource = (): DerivedTrafficSource => ({
    group: 'direct',
    detail: 'Direct',
    referrerHost: null,
    keyword: null,
});

const withUtmSource = (group: TrafficSourceGroup, detail: string): DerivedTrafficSource => ({
    group,
    detail,
    referrerHost: null,
    keyword: null,
});

const inferSourceFromUtm = (
    utmSource: string | null,
    utmMedium: string | null,
): Pick<DerivedTrafficSource, 'group' | 'detail'> | null => {
    const normalizedSource = utmSource?.toLowerCase() ?? '';
    const normalizedMedium = utmMedium?.toLowerCase() ?? '';
    const sourceTokens = normalizedSource.split(/[^a-z0-9]+/);

    if (
        normalizedMedium.includes('organic') ||
        ORGANIC_UTM_SOURCES.some((source) => normalizedSource.includes(source))
    ) {
        return { group: 'organic', detail: prettifyHost(normalizedSource || 'Organic') };
    }

    if (
        normalizedMedium.includes('social') ||
        sourceTokens.some((token) => SOCIAL_UTM_TOKENS.has(token))
    ) {
        return { group: 'social', detail: prettifyHost(normalizedSource || 'Social') };
    }

    if (normalizedMedium.includes('email')) {
        return { group: 'referral', detail: 'Email' };
    }

    if (normalizedMedium.includes('referral')) {
        return { group: 'referral', detail: prettifyHost(normalizedSource || 'Referral') };
    }

    return null;
};

const extractKeywordFromReferrer = (referrerUrl: URL): string | null => {
    for (const param of SEARCH_KEYWORD_PARAMS) {
        const value = referrerUrl.searchParams.get(param)?.trim().replace(/\s+/g, ' ');

        if (value) {
            return value.slice(0, FIELD_LIMITS.keyword);
        }
    }

    return null;
};

const sourceFromReferrerUrl = (referrerUrl: URL): DerivedTrafficSource => {
    const referrerHost = normalizeHost(referrerUrl.hostname);
    const searchReferrer = SEARCH_REFERRERS.find((source) =>
        referrerHost.includes(source.hostIncludes),
    );

    if (searchReferrer) {
        return {
            group: 'organic',
            detail: searchReferrer.detail,
            referrerHost,
            keyword: extractKeywordFromReferrer(referrerUrl),
        };
    }

    const socialReferrer = SOCIAL_REFERRERS.find((source) =>
        referrerHost.includes(source.hostIncludes),
    );

    if (socialReferrer) {
        return {
            group: 'social',
            detail: socialReferrer.detail,
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
};

export const deriveTrafficSource = ({
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
        return withUtmSource(inferredUtmSource.group, inferredUtmSource.detail);
    }

    const normalizedReferrer = normalizeNullableString(referrer);
    if (!normalizedReferrer) {
        return directSource();
    }

    try {
        return sourceFromReferrerUrl(new URL(normalizedReferrer));
    } catch {
        return directSource();
    }
};
