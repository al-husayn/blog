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
    const timeScore =
        Math.min(avgEngagementSeconds / TARGET_ENGAGEMENT_SECONDS, 1) * TIME_SCORE_WEIGHT;
    const scrollScore = Math.min(avgScrollDepth / MAX_ENGAGEMENT_SCORE, 1) * SCROLL_SCORE_WEIGHT;
    const bounceScore = Math.max(0, 1 - bounceRate / MAX_ENGAGEMENT_SCORE) * BOUNCE_SCORE_WEIGHT;

    return Math.round(timeScore + scrollScore + bounceScore);
};
