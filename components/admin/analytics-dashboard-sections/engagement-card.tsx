'use client';

import { ChartNoAxesColumn, Clock3, Gauge } from 'lucide-react';
import { Card, EngagementGauge } from '@/components/admin/analytics-dashboard-primitives';
import { formatDuration, formatPercent } from '@/components/admin/analytics-dashboard-utils';
import { ProgressRow } from '@/components/admin/analytics-dashboard-sections/progress-row';
import { SectionMetricCard } from '@/components/admin/analytics-dashboard-sections/section-metric-card';
import type { AnalyticsDashboardSectionProps } from '@/types/components/admin-analytics';

export function EngagementCard({ data }: AnalyticsDashboardSectionProps) {
    const scrollMilestones = [
        { label: 'Reached 50%', value: data.scrollReach30d.reached50, color: '#0f766e' },
        { label: 'Reached 75%', value: data.scrollReach30d.reached75, color: '#ea580c' },
        { label: 'Reached 100%', value: data.scrollReach30d.reached100, color: '#2563eb' },
    ];

    return (
        <Card
            title='Engagement Quality'
            description='Engaged time, bounce rate, scroll completion, and a single score to judge how healthy article sessions feel overall.'
            className='xl:col-span-5'
        >
            <div className='grid gap-6 xl:grid-cols-[minmax(0,220px)_minmax(0,1fr)] xl:items-center'>
                <div className='flex justify-center xl:justify-start'>
                    <EngagementGauge score={data.engagementScore30d} label='30d reading quality' />
                </div>
                <div className='space-y-4'>
                    <div className='grid gap-3 sm:grid-cols-3'>
                        <SectionMetricCard
                            icon={<Clock3 className='h-4 w-4 text-muted-foreground' />}
                            value={formatDuration(data.avgEngagementSeconds30d)}
                            label='Avg engaged time'
                        />
                        <SectionMetricCard
                            icon={<Gauge className='h-4 w-4 text-muted-foreground' />}
                            value={formatPercent(data.bounceRate30d)}
                            label='Bounce rate'
                        />
                        <SectionMetricCard
                            icon={<ChartNoAxesColumn className='h-4 w-4 text-muted-foreground' />}
                            value={formatPercent(data.avgScrollDepth30d)}
                            label='Avg scroll depth'
                        />
                    </div>
                    <div className='space-y-3 rounded-2xl border border-border/70 bg-background/60 p-4'>
                        {scrollMilestones.map((item) => (
                            <ProgressRow
                                key={item.label}
                                label={item.label}
                                valueLabel={formatPercent(item.value)}
                                percent={item.value}
                                color={item.color}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}
