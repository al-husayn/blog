'use client';

import type React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/api/client';
import { useAdminAnalyticsQuery } from '@/lib/hooks/use-admin-analytics';
import { AnalyticsDashboardView } from '@/components/admin/analytics-dashboard-view';

function DashboardState({
    title,
    description,
    action,
    isLoading = false,
}: {
    title: string;
    description: string;
    action?: React.ReactNode;
    isLoading?: boolean;
}) {
    return (
        <section className='rounded-[26px] border border-border/70 bg-card/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:rounded-[30px] sm:p-8'>
            <div className='flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between'>
                <div className='flex items-start gap-4'>
                    <div className='inline-flex rounded-2xl border border-border/70 bg-background/70 p-3'>
                        {isLoading ? (
                            <RefreshCw className='h-5 w-5 animate-spin text-muted-foreground' />
                        ) : (
                            <AlertTriangle className='h-5 w-5 text-muted-foreground' />
                        )}
                    </div>
                    <div className='space-y-2'>
                        <h1 className='text-2xl font-semibold tracking-tight'>{title}</h1>
                        <p className='max-w-2xl text-sm text-muted-foreground sm:text-base'>
                            {description}
                        </p>
                    </div>
                </div>
                {action}
            </div>
        </section>
    );
}

export function AnalyticsDashboard() {
    const analyticsQuery = useAdminAnalyticsQuery();
    const data = analyticsQuery.data;
    const refreshError =
        analyticsQuery.error && data ? getErrorMessage(analyticsQuery.error) : null;

    if (!data && analyticsQuery.isPending) {
        return (
            <DashboardState
                title='Loading analytics snapshot'
                description='Pulling the latest dashboard metrics now. This keeps the admin view query-driven and ready for refreshes without reloading the page.'
                isLoading
            />
        );
    }

    if (!data) {
        return (
            <DashboardState
                title='Unable to load dashboard analytics'
                description={getErrorMessage(analyticsQuery.error)}
                action={
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => {
                            void analyticsQuery.refetch();
                        }}
                    >
                        <RefreshCw className='h-4 w-4' />
                        Retry
                    </Button>
                }
            />
        );
    }

    return (
        <AnalyticsDashboardView
            data={data}
            isRefreshing={analyticsQuery.isFetching}
            onRefresh={() => {
                void analyticsQuery.refetch();
            }}
            refreshError={refreshError}
        />
    );
}
