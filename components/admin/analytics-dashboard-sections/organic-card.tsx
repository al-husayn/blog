'use client';

import { ChartNoAxesColumn, Search } from 'lucide-react';
import { Card, LineChart } from '@/components/admin/analytics-dashboard-primitives';
import { formatCompactNumber, formatNumber } from '@/components/admin/analytics-dashboard-utils';
import { SectionMetricCard } from '@/components/admin/analytics-dashboard-sections/section-metric-card';
import type { AnalyticsDashboardSectionProps } from '@/types/components/admin-analytics';

export function OrganicCard({ data }: AnalyticsDashboardSectionProps) {
    const latestOrganicVisits = data.organicTrend90d[data.organicTrend90d.length - 1]?.value ?? 0;
    const totalOrganicVisits = data.organicTrend90d.reduce((sum, point) => sum + point.value, 0);

    return (
        <Card
            title='SEO & Growth'
            description='Organic search trend over the last 90 days, plus the keyword fragments still available from search referrers.'
            className='xl:col-span-5'
        >
            <div className='space-y-5'>
                <div className='grid gap-3 sm:grid-cols-2'>
                    <SectionMetricCard
                        icon={<Search className='h-4 w-4 text-muted-foreground' />}
                        value={formatCompactNumber(totalOrganicVisits)}
                        label='Organic visits over the last 90d'
                    />
                    <SectionMetricCard
                        icon={<ChartNoAxesColumn className='h-4 w-4 text-muted-foreground' />}
                        value={formatNumber(latestOrganicVisits)}
                        label='Most recent day on record'
                    />
                </div>
                <LineChart points={data.organicTrend90d} gradientId='organic-trend-fill' />
                <div className='rounded-2xl border border-border/70 bg-background/60 p-4'>
                    <p className='text-sm font-medium'>Top keywords driving traffic</p>
                    <div className='mt-3 space-y-3'>
                        {data.topKeywords90d.length > 0 ? (
                            data.topKeywords90d.map((keyword) => (
                                <div
                                    key={keyword.keyword}
                                    className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4'
                                >
                                    <p className='text-sm text-foreground'>{keyword.keyword}</p>
                                    <p className='text-sm font-medium text-muted-foreground'>
                                        {formatNumber(keyword.visits)} visits
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className='text-sm text-muted-foreground'>
                                Search engines are exposing very little query data right now, so
                                this list will stay sparse until referrers include keywords.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
