'use client';

import { Card, DonutChart } from '@/components/admin/analytics-dashboard-primitives';
import {
    formatCompactNumber,
    formatNumber,
    formatSourceShare,
    sourceColors,
} from '@/components/admin/analytics-dashboard-utils';
import type { AnalyticsDashboardSectionProps } from '@/types/components/admin-analytics';

export function SourcesCard({ data }: AnalyticsDashboardSectionProps) {
    const totalSources = data.sources30d.reduce((sum, source) => sum + source.value, 0);
    const sourceSegments = data.sources30d.map((source) => ({
        label: source.label,
        value: source.value,
        color: sourceColors[source.key] ?? '#64748b',
    }));

    return (
        <Card
            title='Traffic Sources'
            description='Where readers are coming from in the last 30 days, with both share-of-traffic context and the strongest referrer details.'
            className='md:col-span-2 xl:col-span-7'
        >
            <div className='grid gap-6 xl:grid-cols-[minmax(0,220px)_minmax(0,1fr)] xl:items-start'>
                <div className='flex justify-center xl:justify-start'>
                    <DonutChart
                        segments={sourceSegments}
                        centerLabel={formatNumber(totalSources)}
                        centerSubLabel='30d visits'
                    />
                </div>
                <div className='space-y-4'>
                    <div className='overflow-hidden rounded-full bg-muted/60'>
                        <div className='flex h-4 w-full'>
                            {data.sources30d.map((source) => (
                                <div
                                    key={`source-bar-${source.key}`}
                                    style={{
                                        width: `${totalSources === 0 ? 0 : (source.value / totalSources) * 100}%`,
                                        backgroundColor: sourceColors[source.key] ?? '#64748b',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className='grid gap-4 sm:grid-cols-2'>
                        {data.sources30d.map((source) => (
                            <div
                                key={source.key}
                                className='rounded-2xl border border-border/70 bg-background/60 p-4'
                            >
                                <div className='flex items-center justify-between gap-3'>
                                    <div className='flex items-center gap-3'>
                                        <span
                                            className='h-3 w-3 rounded-full'
                                            style={{
                                                backgroundColor:
                                                    sourceColors[source.key] ?? '#64748b',
                                            }}
                                        />
                                        <p className='font-medium'>{source.label}</p>
                                    </div>
                                    <p className='text-sm text-muted-foreground'>
                                        {formatSourceShare(source.value, totalSources)}
                                    </p>
                                </div>
                                <p className='mt-3 text-3xl font-semibold tracking-tight'>
                                    {formatCompactNumber(source.value)}
                                </p>
                                <div className='mt-4 space-y-2 text-sm text-muted-foreground'>
                                    {source.details.length > 0 ? (
                                        source.details.map((detail) => (
                                            <div
                                                key={detail.label}
                                                className='flex items-center justify-between gap-3'
                                            >
                                                <p>{detail.label}</p>
                                                <p className='font-medium text-foreground'>
                                                    {formatNumber(detail.value)}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No source detail recorded yet.</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}
