'use client';

import { useQuery } from '@tanstack/react-query';
import { adminAnalyticsQueryKey, fetchDashboardAnalytics } from '@/lib/api/admin-analytics';

export const useAdminAnalyticsQuery = () =>
    useQuery({
        queryKey: adminAnalyticsQueryKey,
        queryFn: fetchDashboardAnalytics,
    });
