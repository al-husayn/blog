import type { ShareNetwork, TrafficSourceGroup } from '@/types/analytics';

export const DAY_IN_MS = 86_400_000;
export const HOUR_IN_MS = 3_600_000;
export const MAX_DAY_SECONDS = 86_400;
export const MAX_SCROLL_DEPTH = 100;
export const BOUNCE_SCROLL_DEPTH = 50;
export const SESSION_ENGAGEMENT_THRESHOLD_SECONDS = 15;

export const TOP_POST_LIMIT = 8;
export const KEYWORD_LIMIT = 8;
export const SOURCE_DETAIL_LIMIT = 5;
export const COMMENTS_VELOCITY_WINDOW_HOURS = 48;
export const DASHBOARD_MONTHS = 12;
export const WEEK_DAYS = 7;
export const MONTH_DAYS = 30;
export const QUARTER_DAYS = 90;

export const FIELD_LIMITS = {
    id: 128,
    slug: 200,
    path: 500,
    referrer: 1_000,
    utmSource: 100,
    utmMedium: 100,
    utmCampaign: 120,
    keyword: 120,
} as const;

export const PERIODS = [
    { label: '7d', days: WEEK_DAYS },
    { label: '30d', days: MONTH_DAYS },
    { label: '90d', days: QUARTER_DAYS },
    { label: 'All-time', days: null },
] as const;

export const TRAFFIC_SOURCE_GROUPS = ['direct', 'organic', 'social', 'referral'] as const;

export const TRAFFIC_SOURCE_LABELS: Record<TrafficSourceGroup, string> = {
    direct: 'Direct',
    organic: 'Organic search',
    social: 'Social',
    referral: 'Referrals',
};

export const SHARE_NETWORK_LABELS: Record<ShareNetwork, string> = {
    x: 'X/Twitter',
    linkedin: 'LinkedIn',
    facebook: 'Facebook',
    whatsapp: 'WhatsApp',
    native: 'Native share',
    copy_link: 'Copy link',
};
