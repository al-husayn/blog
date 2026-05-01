import { z } from 'zod';
import { FIELD_LIMITS, MAX_DAY_SECONDS, MAX_SCROLL_DEPTH } from '@/lib/analytics/constants';

const trimmedString = (maxLength: number) => z.string().trim().min(1).max(maxLength);

export const pageViewSchema = z.object({
    pageViewId: trimmedString(FIELD_LIMITS.id),
    articleSlug: trimmedString(FIELD_LIMITS.slug),
    path: trimmedString(FIELD_LIMITS.path),
    visitorId: trimmedString(FIELD_LIMITS.id),
    sessionId: trimmedString(FIELD_LIMITS.id),
    referrer: z.string().trim().max(FIELD_LIMITS.referrer).nullish(),
    utmSource: z.string().trim().max(FIELD_LIMITS.utmSource).nullish(),
    utmMedium: z.string().trim().max(FIELD_LIMITS.utmMedium).nullish(),
    utmCampaign: z.string().trim().max(FIELD_LIMITS.utmCampaign).nullish(),
});

export const pageViewCompletionSchema = z.object({
    pageViewId: trimmedString(FIELD_LIMITS.id),
    engagedTimeSeconds: z.number().min(0).max(MAX_DAY_SECONDS),
    maxScrollDepth: z.number().min(0).max(MAX_SCROLL_DEPTH),
    reached50: z.boolean(),
    reached75: z.boolean(),
    reached100: z.boolean(),
});

export const shareEventSchema = z.object({
    articleSlug: trimmedString(FIELD_LIMITS.slug),
    visitorId: trimmedString(FIELD_LIMITS.id),
    sessionId: trimmedString(FIELD_LIMITS.id),
    network: z.enum(['x', 'linkedin', 'facebook', 'whatsapp', 'native', 'copy_link']),
});
