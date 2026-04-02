'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DashboardAnalytics } from '@/types/analytics';
import {
    AudienceCard,
    EngagementCard,
    OrganicCard,
    SourcesCard,
    TopPostsCard,
    ViewsCard,
    ViralityCard,
} from '@/components/admin/analytics-dashboard-sections';
import { dateTimeFormatter } from '@/components/admin/analytics-dashboard-utils';

interface AnalyticsDashboardViewProps {
    data: DashboardAnalytics;
    isRefreshing: boolean;
    onRefresh: () => void;
    refreshError: string | null;
}

export function AnalyticsDashboardView({
    data,
    isRefreshing,
    onRefresh,
    refreshError,
}: AnalyticsDashboardViewProps) {
    return (
        <div className='space-y-5 sm:space-y-6'>
            <header className='rounded-[26px] border border-border/70 bg-[linear-gradient(135deg,rgba(15,118,110,0.14),rgba(37,99,235,0.06)_45%,rgba(234,88,12,0.08)_100%)] p-5 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur sm:rounded-[30px] sm:p-6 lg:p-8'>
                <div className='flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between'>
                    <div className='space-y-3'>
                        <p className='text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground'>
                            Admin Dashboard
                        </p>
                        <div>
                            <h1 className='max-w-4xl text-3xl font-semibold tracking-tight sm:text-4xl xl:text-5xl'>
                                Blog analytics that actually help you make decisions
                            </h1>
                            <p className='mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base'>
                                Traffic, engagement, source attribution, SEO lift, and social velocity,
                                all scoped to the articles that matter most.
                            </p>
                        </div>
                    </div>

                    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end'>
                        <div className='w-full rounded-2xl border border-border/70 bg-background/75 px-4 py-3 text-sm text-muted-foreground sm:w-fit'>
                            <p className='text-xs uppercase tracking-[0.22em] text-muted-foreground'>
                                {isRefreshing ? 'Refreshing' : 'Updated'}
                            </p>
                            <p className='mt-1 font-medium text-foreground'>
                                {dateTimeFormatter.format(new Date(data.generatedAt))}
                            </p>
                            {refreshError ? (
                                <p className='mt-2 max-w-xs text-xs text-amber-700 dark:text-amber-300'>
                                    {refreshError} Showing the last successful snapshot.
                                </p>
                            ) : null}
                        </div>

                        <Button
                            type='button'
                            variant='outline'
                            onClick={onRefresh}
                            disabled={isRefreshing}
                            className='shrink-0'>
                            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                    </div>
                </div>
            </header>

            <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-12 xl:gap-6'>
                <ViewsCard data={data} />
                <AudienceCard data={data} />
                <SourcesCard data={data} />
                <EngagementCard data={data} />
                <ViralityCard data={data} />
                <TopPostsCard data={data} />
                <OrganicCard data={data} />
            </div>
        </div>
    );
}
