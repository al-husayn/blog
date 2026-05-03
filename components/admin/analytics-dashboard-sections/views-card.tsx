'use client';

import { Eye } from 'lucide-react';
import { Card, Sparkline } from '@/components/admin/analytics-dashboard-primitives';
import {
    formatCompactNumber,
    formatDelta,
    formatNumber,
} from '@/components/admin/analytics-dashboard-utils';
import type { AnalyticsDashboardSectionProps } from '@/types/components/admin-analytics';

export function ViewsCard({ data }: AnalyticsDashboardSectionProps) {
    return (
        <Card
            title='Traffic & Reach'
            description='Pageviews across the core reporting windows, with the current month front and center and mini trends for each period.'
            className='md:col-span-2 xl:col-span-7'
        >
            <div className='grid gap-4 2xl:grid-cols-[minmax(0,1.45fr)_minmax(17rem,0.95fr)]'>
                <div className='space-y-5 rounded-[24px] border border-orange-500/20 bg-[linear-gradient(135deg,rgba(234,88,12,0.12),rgba(234,88,12,0.02)_55%,rgba(255,255,255,0))] p-4 sm:p-5'>
                    <div className='flex flex-col items-start justify-between gap-4 sm:flex-row'>
                        <div>
                            <p className='text-sm font-medium uppercase tracking-[0.24em] text-orange-600'>
                                30d Views
                            </p>
                            <div className='mt-3 flex flex-wrap items-end gap-3'>
                                <p className='text-4xl font-semibold tracking-tight sm:text-5xl'>
                                    {formatCompactNumber(data.views30d)}
                                </p>
                                <p className='mb-1 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-700 dark:text-orange-300'>
                                    {formatDelta(data.viewsDeltaVsPrevious30d)}
                                </p>
                            </div>
                            <p className='mt-2 text-sm text-muted-foreground'>
                                Previous 30 days comparison, based on first-party article visits.
                            </p>
                        </div>
                        <div className='w-full rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-left sm:w-auto sm:text-right'>
                            <p className='text-xs uppercase tracking-[0.2em] text-muted-foreground'>
                                Unique 30d
                            </p>
                            <p className='mt-1 text-2xl font-semibold'>
                                {formatNumber(data.uniqueVisitors30d)}
                            </p>
                        </div>
                    </div>
                    <Sparkline points={data.pageviewSparkline} />
                </div>

                <div className='grid gap-3 sm:grid-cols-2'>
                    {data.periods.map((period, index) => (
                        <div
                            key={period.label}
                            className='rounded-[22px] border border-border/70 bg-background/60 p-4'
                        >
                            <div className='flex items-center justify-between gap-3'>
                                <p className='text-sm font-medium text-muted-foreground'>
                                    {period.label}
                                </p>
                                <Eye className='h-4 w-4 text-muted-foreground' />
                            </div>
                            <p className='mt-4 text-2xl font-semibold tracking-tight'>
                                {formatCompactNumber(period.views)}
                            </p>
                            <p className='mt-1 text-sm text-muted-foreground'>
                                {formatNumber(period.uniqueVisitors)} unique visitors
                            </p>
                            <div className='mt-4 h-14'>
                                <Sparkline
                                    points={period.trend}
                                    height={56}
                                    stroke={index % 2 === 0 ? '#0f766e' : '#2563eb'}
                                    gradientId={`period-trend-${period.label}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}
