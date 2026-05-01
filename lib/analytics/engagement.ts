import { clampNumber } from '@/lib/analytics/number';

const MAX_ENGAGEMENT_SCORE = 100;
const TARGET_ENGAGEMENT_SECONDS = 240;
const TIME_SCORE_WEIGHT = 45;
const SCROLL_SCORE_WEIGHT = 35;
const BOUNCE_SCORE_WEIGHT = 20;

export const calculateEngagementScore = ({
    avgEngagementSeconds,
    avgScrollDepth,
    bounceRate,
}: {
    avgEngagementSeconds: number;
    avgScrollDepth: number;
    bounceRate: number;
}): number => {
    const normalizedTime = clampNumber(avgEngagementSeconds / TARGET_ENGAGEMENT_SECONDS, 0, 1);
    const normalizedScroll = clampNumber(avgScrollDepth / MAX_ENGAGEMENT_SCORE, 0, 1);
    const normalizedBounce = clampNumber(1 - bounceRate / MAX_ENGAGEMENT_SCORE, 0, 1);
    const timeScore = normalizedTime * TIME_SCORE_WEIGHT;
    const scrollScore = normalizedScroll * SCROLL_SCORE_WEIGHT;
    const bounceScore = normalizedBounce * BOUNCE_SCORE_WEIGHT;

    return clampNumber(Math.round(timeScore + scrollScore + bounceScore), 0, MAX_ENGAGEMENT_SCORE);
};
