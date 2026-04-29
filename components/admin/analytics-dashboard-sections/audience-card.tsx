'use client';

import {
    Card,
    DonutChart,
} from '@/components/admin/analytics-dashboard-primitives';
import {
    formatNumber,
    sourceColors,
} from '@/components/admin/analytics-dashboard-utils';
import { ProgressRow } from '@/components/admin/analytics-dashboard-sections/progress-row';
import type { AnalyticsDashboardSectionProps } from '@/components/admin/analytics-dashboard-sections/types';

export function AudienceCard({ data }: AnalyticsDashboardSectionProps) {
    const audienceSegments = [
        {
            label: 'New',
            value: data.newVsReturning30d.newVisitors,
            color: sourceColors.new,
        },
        {
            label: 'Returning',
            value: data.newVsReturning30d.returningVisitors,
            color: sourceColors.returning,
        },
    ];

    return (
        <Card
            title='Audience Mix'
            description='Unique reader counts and how much of the current month is driven by fresh discovery versus repeat attention.'
            className='xl:col-span-5'
        >
            <div className='grid gap-6 lg:grid-cols-[minmax(0,180px)_minmax(0,1fr)] lg:items-center'>
                <div className='flex justify-center lg:justify-start'>
                    <DonutChart
                        segments={audienceSegments}
                        centerLabel={formatNumber(data.uniqueVisitors30d)}
                        centerSubLabel='visitors'
                    />
                </div>
                <div className='flex-1 space-y-4'>
                    <div className='grid gap-3 sm:grid-cols-2'>
                        <div className='rounded-2xl border border-border/70 bg-background/60 p-4'>
                            <p className='text-xs uppercase tracking-[0.2em] text-muted-foreground'>
                                30d Unique
                            </p>
                            <p className='mt-2 text-3xl font-semibold'>
                                {formatNumber(data.uniqueVisitors30d)}
                            </p>
                        </div>
                        <div className='rounded-2xl border border-border/70 bg-background/60 p-4'>
                            <p className='text-xs uppercase tracking-[0.2em] text-muted-foreground'>
                                All-time Unique
                            </p>
                            <p className='mt-2 text-3xl font-semibold'>
                                {formatNumber(data.uniqueVisitorsAllTime)}
                            </p>
                        </div>
                    </div>
                    <div className='space-y-3'>
                        {audienceSegments.map((segment) => (
                            <ProgressRow
                                key={segment.label}
                                label={segment.label}
                                valueLabel={`${formatNumber(segment.value)} readers`}
                                percent={
                                    data.newVsReturning30d.total === 0
                                        ? 0
                                        : (segment.value / data.newVsReturning30d.total) * 100
                                }
                                color={segment.color}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}
