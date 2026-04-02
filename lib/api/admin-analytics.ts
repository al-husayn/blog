import { requestJson } from '@/lib/api/client';
import type { DashboardAnalytics } from '@/types/analytics';

export const adminAnalyticsQueryKey = ['admin', 'analytics'] as const;

export const fetchDashboardAnalytics = (): Promise<DashboardAnalytics> =>
    requestJson<DashboardAnalytics>('/api/admin/analytics', {
        cache: 'no-store',
    });
